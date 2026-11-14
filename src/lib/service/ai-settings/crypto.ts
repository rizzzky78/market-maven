import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

const VERSION = "v1";
const ALGORITHM = "aes-256-gcm";

let cachedKey: Buffer | null = null;

/**
 * 256-bit key derived from MAVEN_ENCRYPTION_KEY with HKDF, so any long random
 * string works as the secret. Throws when it is not configured: saving a key
 * unencrypted is never an option.
 */
const getKey = () => {
  if (cachedKey) return cachedKey;

  const secret = process.env.MAVEN_ENCRYPTION_KEY;
  if (!secret || secret.length < 16) {
    throw new Error("MAVEN_ENCRYPTION_KEY is not set (at least 16 characters)");
  }

  cachedKey = Buffer.from(
    hkdfSync("sha256", secret, "maven-ai-connection", "api-key", 32)
  );
  return cachedKey;
};

/**
 * Encrypts an API key. `context` (user and connection id) is bound as
 * additional data, so a ciphertext copied to another row fails to decrypt.
 * Format: `v1.<iv>.<tag>.<ciphertext>` in base64url.
 */
export function encryptSecret(plain: string, context: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  cipher.setAAD(Buffer.from(context));
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);

  return [VERSION, iv, cipher.getAuthTag(), data]
    .map((part) => (typeof part === "string" ? part : part.toString("base64url")))
    .join(".");
}

/** Decrypts a value from `encryptSecret`; throws when it was tampered with. */
export function decryptSecret(value: string, context: string): string {
  const [version, iv, tag, data] = value.split(".");
  if (version !== VERSION || !iv || !tag || !data) {
    throw new Error("Unsupported secret format");
  }

  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(iv, "base64url"));
  decipher.setAAD(Buffer.from(context));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(data, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

/** Last characters of a key for display, such as `...a1b2`. */
export const secretHint = (plain: string) =>
  plain.length > 8 ? `...${plain.slice(-4)}` : "...";

/** Additional data binding a connection's key to its owner and row. */
export const connectionContext = (userId: string, connectionId: string) =>
  `${userId}:${connectionId}`;
