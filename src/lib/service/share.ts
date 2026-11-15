import { createId } from "@paralleldrive/cuid2";
import { ComponentType } from "../types/neon";

/**
 * Unguessable token for a public share URL. Collision-resistant, so the
 * unique `reference_id` constraint never trips on concurrent shares.
 */
export function createShareReferenceId(): string {
  return createId();
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
