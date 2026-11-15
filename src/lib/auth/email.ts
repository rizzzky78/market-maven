import { createHash } from "node:crypto";
import { Resend } from "resend";
import { getResendConfig } from "@/lib/auth/config";
import logger from "@/lib/utility/logger";

type AuthEmailKind = "verify-email" | "reset-password";

const COPY: Record<
  AuthEmailKind,
  { subject: string; heading: string; body: string; action: string; expiry: string }
> = {
  "verify-email": {
    subject: "Verify your email for Maven AI",
    heading: "Confirm your email",
    body: "Thanks for signing up to Maven AI. Confirm this email address to activate your account.",
    action: "Verify email",
    expiry: "This link expires in 1 hour.",
  },
  "reset-password": {
    subject: "Reset your Maven AI password",
    heading: "Reset your password",
    body: "We received a request to reset the password of your Maven AI account.",
    action: "Choose a new password",
    expiry: "This link expires in 1 hour and can be used once.",
  },
};

let client: Resend | null = null;

function getClient(apiKey: string): Resend {
  client ??= new Resend(apiKey);
  return client;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Plain, inline-styled HTML that renders in every mail client. */
function renderHtml(kind: AuthEmailKind, name: string, url: string): string {
  const copy = COPY[kind];
  const safeUrl = escapeHtml(url);
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#1a1a1d;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:24px;padding:32px;">
            <tr><td style="font-size:14px;letter-spacing:2px;font-weight:bold;color:#a855f7;">MAVEN AI</td></tr>
            <tr><td style="padding-top:16px;font-size:22px;font-weight:bold;">${copy.heading}</td></tr>
            <tr><td style="padding-top:12px;font-size:15px;line-height:1.6;">Hi ${escapeHtml(name)},<br />${copy.body}</td></tr>
            <tr>
              <td style="padding-top:24px;">
                <a href="${safeUrl}" style="display:inline-block;background:#a855f7;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:12px 24px;border-radius:999px;">${copy.action}</a>
              </td>
            </tr>
            <tr><td style="padding-top:24px;font-size:13px;line-height:1.6;color:#6b6b70;">${copy.expiry} If the button does not work, open this link:<br /><a href="${safeUrl}" style="color:#6b6b70;word-break:break-all;">${safeUrl}</a></td></tr>
            <tr><td style="padding-top:24px;font-size:13px;color:#6b6b70;">If you did not request this, you can ignore this email.</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText(kind: AuthEmailKind, name: string, url: string): string {
  const copy = COPY[kind];
  return `Hi ${name},\n\n${copy.body}\n\n${copy.action}: ${url}\n\n${copy.expiry}\nIf you did not request this, you can ignore this email.`;
}

/**
 * Sends an email verification or password reset link through Resend. The
 * idempotency key is derived from the single-use token, so a retried send
 * never delivers twice. Throws when Resend is not configured or rejects.
 */
export async function sendAuthEmail(
  kind: AuthEmailKind,
  to: { email: string; name: string },
  url: string,
  token: string
): Promise<void> {
  const config = getResendConfig();
  if (!config) {
    throw new Error("Email delivery is not configured");
  }

  const tokenHash = createHash("sha256").update(token).digest("hex").slice(0, 32);
  const { error } = await getClient(config.apiKey).emails.send(
    {
      from: config.from,
      to: [to.email],
      subject: COPY[kind].subject,
      html: renderHtml(kind, to.name, url),
      text: renderText(kind, to.name, url),
    },
    { idempotencyKey: `${kind}/${tokenHash}` }
  );

  if (error) {
    logger.error("Resend auth email failed", {
      kind,
      error: error.message,
      recipient: to.email.replace(/^(.).*(@.*)$/, "$1***$2"),
    });
    throw new Error("Failed to send the email");
  }
}
