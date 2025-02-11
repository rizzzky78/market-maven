import { ComponentType } from "../types/neon";

export function createShareReferenceId(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  let hash = 0;

  for (let i = 0; i < normalizedEmail.length; i++) {
    const char = normalizedEmail.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const timestamp = Date.now() % 10000;
  const emailHash = Math.abs(hash).toString(36).slice(0, 8);
  return `${emailHash}${timestamp}`;
}

export function createShareURL(
  baseUrl: string,
  type: ComponentType,
  componentId: string,
  referenceId: string
): string {
  const url = new URL("/share", baseUrl);
  url.searchParams.append("type", type);
  url.searchParams.append("component-id", componentId);
  url.searchParams.append("reff-id", referenceId);
  return url.toString();
}
