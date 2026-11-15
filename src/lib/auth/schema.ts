import { z } from "zod";

/** Username length bounds, mirrored by the Better Auth username plugin. */
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

/** Password length bounds, mirrored by Better Auth `emailAndPassword`. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** Length of the WhatsApp one-time code. */
export const OTP_LENGTH = 6;

/**
 * Letters, digits, dots and underscores, starting with a letter. Requiring a
 * leading letter keeps usernames from ever looking like a phone number, so
 * the single "username or phone" login field stays unambiguous.
 */
const USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9._]*$/;

/** E.164: a plus sign, a non-zero country digit, 8 to 15 digits in total. */
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

/**
 * Strips spaces, dashes, dots and brackets, and turns a leading `00`
 * international prefix into `+`. Does not guess a country code.
 */
export function normalizePhoneNumber(value: string): string {
  const compact = value.replace(/[\s\-().]/g, "");
  return compact.startsWith("00") ? `+${compact.slice(2)}` : compact;
}

/** True when the value, once normalized, is an E.164 phone number. */
export function isPhoneNumber(value: string): boolean {
  return E164_PATTERN.test(normalizePhoneNumber(value));
}

/** True when the username matches the allowed characters and bounds. */
export function isValidUsername(value: string): boolean {
  return (
    value.length >= USERNAME_MIN_LENGTH &&
    value.length <= USERNAME_MAX_LENGTH &&
    USERNAME_PATTERN.test(value)
  );
}

export const usernameSchema = z
  .string()
  .trim()
  .min(USERNAME_MIN_LENGTH, `At least ${USERNAME_MIN_LENGTH} characters`)
  .max(USERNAME_MAX_LENGTH, `At most ${USERNAME_MAX_LENGTH} characters`)
  .regex(
    USERNAME_PATTERN,
    "Start with a letter; use letters, numbers, dots or underscores"
  );

export const phoneNumberSchema = z
  .string()
  .transform(normalizePhoneNumber)
  .pipe(
    z
      .string()
      .regex(
        E164_PATTERN,
        "Use international format with country code, e.g. +6281234567890"
      )
  );

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `At least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `At most ${PASSWORD_MAX_LENGTH} characters`);

export const otpSchema = z
  .string()
  .trim()
  .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter the ${OTP_LENGTH}-digit code`);

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address").max(254));

/** True when the value looks like an email address (login field detection). */
export function isEmail(value: string): boolean {
  return emailSchema.safeParse(value).success;
}
