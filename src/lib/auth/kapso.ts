import { getKapsoConfig } from "@/lib/auth/config";
import logger from "@/lib/utility/logger";

/** Upper bound for one Kapso API call, so a hung request cannot pile up. */
const KAPSO_TIMEOUT_MS = 10_000;

/**
 * Sends a one-time code through a Meta-approved WhatsApp Authentication
 * template via Kapso's Meta Cloud API proxy. The code fills the body
 * placeholder `{{1}}` and the copy-code button, which Authentication
 * templates always carry.
 *
 * Throws when Kapso is not configured or the API rejects the message; the
 * phone number is never logged in full.
 */
export async function sendWhatsAppOtp(
  phoneNumber: string,
  code: string
): Promise<void> {
  const config = getKapsoConfig();
  if (!config) {
    throw new Error("WhatsApp OTP delivery is not configured");
  }

  const response = await fetch(
    `${config.baseUrl}/${encodeURIComponent(config.phoneNumberId)}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": config.apiKey,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneNumber.replace(/^\+/, ""),
        type: "template",
        template: {
          name: config.templateName,
          language: { code: config.templateLanguage },
          components: [
            { type: "body", parameters: [{ type: "text", text: code }] },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: code }],
            },
          ],
        },
      }),
      signal: AbortSignal.timeout(KAPSO_TIMEOUT_MS),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    logger.error("Kapso WhatsApp OTP send failed", {
      status: response.status,
      recipient: `***${phoneNumber.slice(-4)}`,
      detail: detail.slice(0, 500),
    });
    throw new Error("Failed to send the WhatsApp verification code");
  }
}
