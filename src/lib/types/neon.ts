import { z } from "zod";

// Schema Validation
export const storeValueSchema = z.object({
  key: z.string().uuid(),
  metadata: z.object({
    chatId: z.string(),
    email: z.string().email(),
  }),
  value: z.string(),
});

// Type inference from schema
export type StoreValue = z.infer<typeof storeValueSchema>;

export type StoredValue<T = unknown> = Pick<StoreValue, "key" | "value"> & {
  value: T;
};
