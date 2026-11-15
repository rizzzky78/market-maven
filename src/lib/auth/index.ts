import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { captcha, phoneNumber, username } from "better-auth/plugins";
import { headers } from "next/headers";
import { prisma } from "@/database/prisma";
import {
  getOAuthCredentials,
  getResendConfig,
  getTurnstileConfig,
  isPhoneCountryAllowed,
} from "@/lib/auth/config";
import { sendAuthEmail } from "@/lib/auth/email";
import { sendWhatsAppOtp } from "@/lib/auth/kapso";
import {
  consumeRateLimit,
  formatRetryAfter,
  redisRateLimitStorage,
} from "@/lib/auth/rate-limit";
import {
  isPhoneNumber,
  isValidUsername,
  OTP_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@/lib/auth/schema";
import logger from "@/lib/utility/logger";

const oauth = getOAuthCredentials();
const turnstile = getTurnstileConfig();

/** Lifetime of email verification and password reset links, in seconds. */
const EMAIL_LINK_TTL_SECONDS = 60 * 60;

/** Logs a failed background email send without exposing it to the caller. */
function logSendFailure(kind: string) {
  return (error: unknown) =>
    logger.error(`Sending ${kind} email failed`, {
      error: error instanceof Error ? error.message : String(error),
    });
}

/** Normalized email from a request body, or an empty string. */
function bodyEmail(body: unknown): string {
  const email = (body as { email?: unknown } | undefined)?.email;
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

/**
 * Better Auth server instance.
 *
 * Sign-in methods: Google and GitHub OAuth (each only when its credentials
 * are set) and username, email or phone number with a password. Sign-up
 * requires username, email and password, and the account stays locked until
 * the emailed verification link (sent through Resend) is opened. Password
 * reset works by email link, or by WhatsApp code for verified phone numbers
 * once Kapso is configured. The public OTP send/verify routes stay closed.
 */
export const auth = betterAuth({
  // ponytail: NEXTAUTH_* fallbacks keep pre-Better Auth deployments working; drop them once envs are renamed.
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: oauth,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
    revokeSessionsOnPasswordReset: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: EMAIL_LINK_TTL_SECONDS,
    sendResetPassword: async ({ user, url, token }) => {
      // Not awaited: response time must not reveal whether the email exists.
      void sendAuthEmail(
        "reset-password",
        { email: user.email, name: user.name },
        url,
        token
      ).catch(logSendFailure("password reset"));
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: EMAIL_LINK_TTL_SECONDS,
    sendVerificationEmail: async ({ user, url, token }) => {
      void sendAuthEmail(
        "verify-email",
        { email: user.email, name: user.name },
        url,
        token
      ).catch(logSendFailure("verification"));
    },
  },
  user: {
    deleteUser: { enabled: true },
  },
  session: {
    // Signed session data in a short-lived cookie spares a database lookup
    // for every proxy and page session check.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  /**
   * HTTP-only blocks; server code can still call these through `auth.api`.
   * Phone OTP send/verify would let anyone trigger paid WhatsApp messages
   * or sign in passwordless; email changes are not offered yet.
   */
  disabledPaths: [
    "/change-email",
    "/phone-number/send-otp",
    "/phone-number/verify",
    "/is-username-available",
  ],
  rateLimit: {
    customStorage: redisRateLimitStorage,
    customRules: {
      "/sign-up/email": { window: 3600, max: 5 },
      "/sign-in/email": { window: 60, max: 5 },
      "/send-verification-email": { window: 600, max: 3 },
      "/request-password-reset": { window: 600, max: 3 },
      "/reset-password": { window: 600, max: 5 },
      "/sign-in/username": { window: 60, max: 5 },
      "/sign-in/phone-number": { window: 60, max: 5 },
      "/sign-in/social": { window: 60, max: 10 },
      "/phone-number/request-password-reset": { window: 600, max: 3 },
      "/phone-number/reset-password": { window: 600, max: 5 },
      "/delete-user": { window: 600, max: 5 },
    },
  },
  hooks: {
    /**
     * Sign-up must carry a valid username (the username plugin alone treats
     * it as optional). Emails sent to one address are capped per hour on top
     * of the per-IP limits. Phone reset requests refuse numbers outside the
     * allowed countries and cap codes per number, since each is a paid
     * WhatsApp message.
     */
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        // Without email delivery the account could never be verified.
        if (!getResendConfig()) {
          throw new APIError("SERVICE_UNAVAILABLE", {
            message: "Sign up is not available right now",
          });
        }
        const name = (ctx.body as { username?: unknown } | undefined)?.username;
        if (typeof name !== "string" || !isValidUsername(name.trim())) {
          throw new APIError("BAD_REQUEST", {
            message: "A valid username is required",
          });
        }
        /**
         * Frees the username and email held by credential signups whose
         * verification link has expired, so abandoned or mistyped signups
         * cannot squat them.
         */
        await prisma.user.deleteMany({
          where: {
            emailVerified: false,
            createdAt: { lt: new Date(Date.now() - EMAIL_LINK_TTL_SECONDS * 1000) },
            OR: [{ username: name.trim().toLowerCase() }, { email: bodyEmail(ctx.body) }],
            accounts: { every: { providerId: "credential" } },
          },
        });
        return;
      }

      if (
        ctx.path === "/send-verification-email" ||
        ctx.path === "/request-password-reset"
      ) {
        const email = bodyEmail(ctx.body);
        if (!email) return;
        const limit = await consumeRateLimit(`email-send:${email}`, {
          window: 3600,
          max: 3,
        });
        if (!limit.allowed) {
          throw new APIError("TOO_MANY_REQUESTS", {
            message: `Too many emails requested. Try again in ${formatRetryAfter(limit.retryAfter)}.`,
          });
        }
        return;
      }

      if (ctx.path !== "/phone-number/request-password-reset") return;

      const phone = String(ctx.body?.phoneNumber ?? "");
      if (!isPhoneNumber(phone) || !isPhoneCountryAllowed(phone)) {
        throw new APIError("BAD_REQUEST", {
          message: "This phone number is not supported",
        });
      }

      const limit = await consumeRateLimit(`reset-phone:${phone}`, {
        window: 3600,
        max: 3,
      });
      if (!limit.allowed) {
        throw new APIError("TOO_MANY_REQUESTS", {
          message: `Too many codes requested. Try again in ${formatRetryAfter(limit.retryAfter)}.`,
        });
      }
    }),
  },
  plugins: [
    username({
      minUsernameLength: USERNAME_MIN_LENGTH,
      maxUsernameLength: USERNAME_MAX_LENGTH,
      usernameValidator: isValidUsername,
    }),
    phoneNumber({
      otpLength: OTP_LENGTH,
      expiresIn: 300,
      allowedAttempts: 3,
      requireVerification: true,
      phoneNumberValidator: isPhoneNumber,
      sendOTP: ({ phoneNumber: phone, code }) => {
        // Not awaited by design (timing attacks); failures are logged.
        void sendWhatsAppOtp(phone, code).catch((error) =>
          logger.error("Sending verification OTP failed", {
            error: error instanceof Error ? error.message : String(error),
          })
        );
      },
      sendPasswordResetOTP: ({ phoneNumber: phone, code }) => {
        void sendWhatsAppOtp(phone, code).catch((error) =>
          logger.error("Sending password reset OTP failed", {
            error: error instanceof Error ? error.message : String(error),
          })
        );
      },
    }),
    ...(turnstile
      ? [
          captcha({
            provider: "cloudflare-turnstile",
            secretKey: turnstile.secretKey,
            endpoints: [
              "/sign-up/email",
              "/sign-in/email",
              "/send-verification-email",
              "/request-password-reset",
              "/sign-in/username",
              "/sign-in/phone-number",
              "/phone-number/request-password-reset",
            ],
          }),
        ]
      : []),
    // Must stay last: lets server actions set auth cookies.
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;

/**
 * Current session (`{ user, session }`) for server components, route
 * handlers and server actions, or `null` when signed out.
 */
export async function getSession(): Promise<AuthSession | null> {
  return auth.api.getSession({ headers: await headers() });
}
