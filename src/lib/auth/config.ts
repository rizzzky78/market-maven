/**
 * Server-side auth feature switches, derived from environment variables at
 * request time (not inlined at build time), so one image can run with any
 * mix of providers enabled.
 */

/** OAuth provider ids the app knows how to render. */
export type OAuthProviderId = "google" | "github";

/** Public, non-secret view of the auth setup, safe to pass to the client. */
export type AuthFeatures = {
  /** OAuth providers whose client id and secret are both set. */
  oauthProviders: OAuthProviderId[];
  /**
   * Email delivery through Resend: signup (email verification link) and
   * password reset by email both need it.
   */
  email: boolean;
  /** WhatsApp OTP delivery through Kapso, used for phone password reset. */
  whatsappOtp: boolean;
  /** Turnstile site key when captcha is enabled, otherwise `null`. */
  captchaSiteKey: string | null;
};

function readEnv(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

/** OAuth client credentials keyed by provider, only for configured ones. */
export function getOAuthCredentials(): Partial<
  Record<OAuthProviderId, { clientId: string; clientSecret: string }>
> {
  const credentials: Partial<
    Record<OAuthProviderId, { clientId: string; clientSecret: string }>
  > = {};

  const googleId = readEnv("AUTH_GOOGLE_ID");
  const googleSecret = readEnv("AUTH_GOOGLE_SECRET");
  if (googleId && googleSecret) {
    credentials.google = { clientId: googleId, clientSecret: googleSecret };
  }

  const githubId = readEnv("AUTH_GITHUB_ID");
  const githubSecret = readEnv("AUTH_GITHUB_SECRET");
  if (githubId && githubSecret) {
    credentials.github = { clientId: githubId, clientSecret: githubSecret };
  }

  return credentials;
}

/** Kapso WhatsApp settings, or `null` when any required value is missing. */
export function getKapsoConfig(): {
  apiKey: string;
  phoneNumberId: string;
  templateName: string;
  templateLanguage: string;
  baseUrl: string;
} | null {
  const apiKey = readEnv("KAPSO_API_KEY");
  const phoneNumberId = readEnv("KAPSO_PHONE_NUMBER_ID");
  const templateName = readEnv("KAPSO_OTP_TEMPLATE_NAME");
  if (!apiKey || !phoneNumberId || !templateName) return null;

  return {
    apiKey,
    phoneNumberId,
    templateName,
    templateLanguage: readEnv("KAPSO_OTP_TEMPLATE_LANGUAGE") ?? "en_US",
    baseUrl: (
      readEnv("KAPSO_API_BASE_URL") ??
      "https://api.kapso.ai/meta/whatsapp/v24.0"
    ).replace(/\/+$/, ""),
  };
}

/** Resend settings, or `null` unless both the API key and sender are set. */
export function getResendConfig(): { apiKey: string; from: string } | null {
  const apiKey = readEnv("RESEND_API_KEY");
  const from = readEnv("RESEND_FROM_EMAIL");
  return apiKey && from ? { apiKey, from } : null;
}

/** Turnstile keys, or `null` unless both the site and secret key are set. */
export function getTurnstileConfig(): {
  siteKey: string;
  secretKey: string;
} | null {
  const siteKey = readEnv("TURNSTILE_SITE_KEY");
  const secretKey = readEnv("TURNSTILE_SECRET_KEY");
  return siteKey && secretKey ? { siteKey, secretKey } : null;
}

/**
 * Country calling codes (digits only, e.g. `62`) allowed to receive OTPs.
 * An empty list allows every country.
 */
export function getAllowedCountryCodes(): string[] {
  return (readEnv("AUTH_PHONE_ALLOWED_COUNTRY_CODES") ?? "")
    .split(",")
    .map((code) => code.trim().replace(/^\+/, ""))
    .filter((code) => /^\d{1,4}$/.test(code));
}

/**
 * True when an E.164 number belongs to an allowed country. Calling codes are
 * prefix-free, so a prefix match is exact.
 */
export function isPhoneCountryAllowed(phoneNumber: string): boolean {
  const allowed = getAllowedCountryCodes();
  return (
    allowed.length === 0 ||
    allowed.some((code) => phoneNumber.startsWith(`+${code}`))
  );
}

/** Public auth features for login, signup and reset pages. */
export function getAuthFeatures(): AuthFeatures {
  return {
    oauthProviders: Object.keys(getOAuthCredentials()) as OAuthProviderId[],
    email: getResendConfig() !== null,
    whatsappOtp: getKapsoConfig() !== null,
    captchaSiteKey: getTurnstileConfig()?.siteKey ?? null,
  };
}
