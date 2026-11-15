import { getTurnstileConfig } from "@/lib/auth/config";
import logger from "@/lib/utility/logger";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifies a Turnstile token for server actions, which the Better Auth
 * captcha plugin does not cover (it only guards HTTP auth routes). Returns
 * true when captcha is disabled. Fails closed on network errors.
 */
export async function verifyCaptchaToken(
  token: string | undefined,
  remoteIp: string | null
): Promise<boolean> {
  const config = getTurnstileConfig();
  if (!config) return true;
  if (!token) return false;

  const body = new URLSearchParams({ secret: config.secretKey, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    logger.error("Turnstile verification failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
