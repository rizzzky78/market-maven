import { z } from "zod";

/**
 * Store schema validation
 */
export const storeValueSchema = z.object({
  key: z.string().uuid(),
  metadata: z.object({
    chatId: z.string(),
    email: z.string().email(),
  }),
  value: z.record(z.unknown()),
});

/**
 * Type inference from schema
 */
export type StoreValue = z.infer<typeof storeValueSchema>;

/**
 * Stored value type with additional T value type
 */
export type StoredValue<T = unknown> = {
  key: string;
  value: T;
};
