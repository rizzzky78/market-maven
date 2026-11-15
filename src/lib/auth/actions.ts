"use server";

import { createId } from "@paralleldrive/cuid2";
import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";
import { prisma } from "@/database/prisma";
import { auth } from "@/lib/auth";
import { getKapsoConfig, isPhoneCountryAllowed } from "@/lib/auth/config";
import { consumeRateLimit, formatRetryAfter } from "@/lib/auth/rate-limit";
import {
  signupCompleteSchema,
  signupRequestSchema,
  type SignupCompleteInput,
  type SignupRequestInput,
} from "@/lib/auth/schema";
import { verifyCaptchaToken } from "@/lib/auth/turnstile";
import logger from "@/lib/utility/logger";

/** Field a signup error belongs to, so the form can mark the right input. */
type SignupField = "username" | "phoneNumber" | "password" | "code" | "captcha";

export type SignupActionResult =
  | { ok: true }
  | { ok: false; error: string; field?: SignupField };

/**
 * Domain for the internal email Better Auth requires on every user.
 * `.invalid` is reserved (RFC 2606), so it can never receive mail or collide
 * with a real OAuth email.
 */
const INTERNAL_EMAIL_DOMAIN = "credential.maven.invalid";

/** Client IP from the proxy headers, used as a rate limit and captcha hint. */
async function getClientIp(): Promise<string | null> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || requestHeaders.get("x-real-ip") || null;
}

/** Applies a rate limit and returns a ready error result when exceeded. */
async function limit(
  key: string,
  rule: { window: number; max: number }
): Promise<SignupActionResult | null> {
  const result = await consumeRateLimit(key, rule);
  return result.allowed
    ? null
    : {
        ok: false,
        error: `Too many attempts. Try again in ${formatRetryAfter(result.retryAfter)}.`,
      };
}

/** Checks that neither the username nor the phone number is registered. */
async function findConflict(
  username: string,
  phoneNumber: string
): Promise<SignupActionResult | null> {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username: username.toLowerCase() }, { phoneNumber }],
    },
    select: { username: true, phoneNumber: true },
  });

  if (!existing) return null;
  if (existing.username === username.toLowerCase()) {
    return { ok: false, error: "This username is taken", field: "username" };
  }
  return {
    ok: false,
    error: "This phone number is already registered",
    field: "phoneNumber",
  };
}

/**
 * Signup step one: validates the details, checks captcha, availability and
 * the country allowlist, then sends a WhatsApp code to the phone number.
 * Nothing is stored except the short-lived code.
 */
export async function requestSignupOtp(
  input: SignupRequestInput
): Promise<SignupActionResult> {
  const parsed = signupRequestSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.message ?? "Invalid details",
      field: issue?.path[0] as SignupField | undefined,
    };
  }
  const { username, phoneNumber, captchaToken } = parsed.data;

  if (!getKapsoConfig()) {
    return { ok: false, error: "Sign up is not available right now" };
  }

  const ip = await getClientIp();
  if (!(await verifyCaptchaToken(captchaToken, ip))) {
    return { ok: false, error: "Captcha check failed, try again", field: "captcha" };
  }

  if (!isPhoneCountryAllowed(phoneNumber)) {
    return {
      ok: false,
      error: "Phone numbers from this country are not supported yet",
      field: "phoneNumber",
    };
  }

  const limited =
    (await limit(`signup-otp-ip:${ip ?? "unknown"}`, { window: 3600, max: 10 })) ??
    (await limit(`signup-otp-phone:${phoneNumber}`, { window: 3600, max: 3 }));
  if (limited) return limited;

  const conflict = await findConflict(username, phoneNumber);
  if (conflict) return conflict;

  try {
    await auth.api.sendPhoneNumberOTP({
      body: { phoneNumber },
      headers: await headers(),
    });
    return { ok: true };
  } catch (error) {
    logger.error("Signup OTP request failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: "Could not send the code. Try again shortly." };
  }
}

/**
 * Signup step two: consumes the WhatsApp code, creates the credential user
 * with an internal email, marks the phone as verified and signs the user in
 * (session cookie set through the `nextCookies` plugin).
 */
export async function completeSignup(
  input: SignupCompleteInput
): Promise<SignupActionResult> {
  const parsed = signupCompleteSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.message ?? "Invalid details",
      field: issue?.path[0] as SignupField | undefined,
    };
  }
  const { username, phoneNumber, password, code } = parsed.data;

  const ip = await getClientIp();
  const limited = await limit(`signup-verify-ip:${ip ?? "unknown"}`, {
    window: 600,
    max: 10,
  });
  if (limited) return limited;

  const conflict = await findConflict(username, phoneNumber);
  if (conflict) return conflict;

  try {
    await auth.api.consumePhoneNumberOTP({ body: { phoneNumber, code } });
  } catch (error) {
    if (isAPIError(error)) {
      return {
        ok: false,
        error:
          error.status === "FORBIDDEN"
            ? "Too many wrong codes. Request a new one."
            : "The code is invalid or expired",
        field: "code",
      };
    }
    throw error;
  }

  let userId: string | null = null;
  try {
    const result = await auth.api.signUpEmail({
      body: {
        email: `${createId()}@${INTERNAL_EMAIL_DOMAIN}`,
        name: username,
        password,
        username,
        displayUsername: username,
      },
      headers: await headers(),
    });
    userId = result.user.id;

    /**
     * Written directly: the phone-number plugin refuses to set a phone on
     * sign-up or update unless it is already verified, which the consumed
     * OTP above has just proven.
     */
    await prisma.user.update({
      where: { id: userId },
      data: { phoneNumber, phoneNumberVerified: true },
    });

    return { ok: true };
  } catch (error) {
    // Undo a half-created account (e.g. a concurrent signup took the phone).
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
    logger.error("Signup completion failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      ok: false,
      error: "Could not create the account. Check your details and try again.",
    };
  }
}
