import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { captcha, phoneNumber, username } from "better-auth/plugins";
import { headers } from "next/headers";
import { prisma } from "@/database/prisma";
import {
  getOAuthCredentials,
  getTurnstileConfig,
  isPhoneCountryAllowed,
} from "@/lib/auth/config";
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

/**
 * Better Auth server instance.
 *
 * Sign-in methods: Google and GitHub OAuth (each only when its credentials
 * are set) and username or phone number with a password. Credential accounts
 * are created only by the signup server actions after a WhatsApp OTP check,
 * so the raw email sign-up/sign-in routes and the public OTP send/verify
 * routes are closed over HTTP; password reset runs through the phone-number
 * plugin with a WhatsApp code.
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
   * HTTP-only blocks; server code still calls these through `auth.api`.
   * Sign-up must go through the OTP-gated signup actions, credential users
   * have no real email, and OTP send/verify would otherwise let anyone
   * trigger paid WhatsApp messages or sign in passwordless.
   */
  disabledPaths: [
    "/sign-up/email",
    "/sign-in/email",
    "/request-password-reset",
    "/reset-password",
    "/send-verification-email",
    "/verify-email",
    "/change-email",
    "/phone-number/send-otp",
    "/phone-number/verify",
    "/is-username-available",
  ],
  rateLimit: {
    customStorage: redisRateLimitStorage,
    customRules: {
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
     * Password reset requests: refuse numbers outside the allowed countries
     * and cap codes per phone number on top of the per-IP limit, since each
     * code is a paid WhatsApp message.
     */
    before: createAuthMiddleware(async (ctx) => {
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
