import { ErrorResponse, ScrapeResponse } from "@mendable/firecrawl-js";
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

export type KeyValueType = "markdown" | "object";

export type BaseKeyValue = {
  chatId: string;
  owner: string;
};

export type KeyValueMarkdown = {
  key: string;
  data: string;
  createdAt: Date;
} & BaseKeyValue;

export type KeyValueObject<T> = {
  key: string;
  data: T;
  createdAt: Date;
} & BaseKeyValue;

export type ResultedTypeTool =
  | "search-product"
  | "get-product-details"
  | "products-comparison";

export type Shape = {
  key: string;
  chatId: string;
  owner: string;
  data: {
    type: ResultedTypeTool;
    content: Record<string, any>[];
  };
};

export type MarkdownType = "product-search" | "product-details";

/** A representation type of stored markdown data also the schema of data type */
export type MarkdownStore<T = MarkdownType> = {
  /** A uuid primary key to access the data, this are inputed manualy from API */
  key: string;
  /** This data inputed manualy from API */
  chatId: string;
  /** This data inputed manualy from API */
  owner: string;
  /** Timestamp to tract data time data created, this handled automaticaly by database */
  timestamp: string;
  /** A type that represent what type markdown are stored */
  type: T;
  /** Contained raw markdown data from scrape result without stringifycation or string modification */
  markdown: string;
};

/** A representation type of payload API to store the markdown data */
export type MarkdownStoreDTO = {
  key: string;
  chatId: string;
  owner: string;
  type: MarkdownType;
  markdown: string;
};

export type ObjectType =
  | "searchProduct"
  | "getProductDetails"
  | "productsComparison";

/**
 * A type represent stored Object Data type
 */
export type ObjectStore = {
  /** A uuid primary key to access the data, this are inputed manualy from API */
  key: string;
  /** This data inputed manualy from API */
  chatId: string;
  /** This data inputed manualy from API */
  owner: string;
  /** Timestamp to tract data time data created, this handled automaticaly by database */
  timestamp: string;
  /** A source type coresponding contained object data */
  type: ObjectType;
  /** A type represent the contained object data */
  object: Record<string, any>;
};

/** A representation type of payload API to store the object data */
export type ObjectStoreDTO = {
  key: string;
  chatId: string;
  owner: string;
  type: ObjectType;
  object: Record<string, any>;
};

/**
 * Map object types to their corresponding data structures
 */
export type ObjectTypeMap = {
  searchProduct: Record<string, any>;
  getProductDetails: Record<string, any>;
  productsComparison: Record<string, any>;
};

/**
 * Enhanced ObjectStore type with generic support
 */
export type TypedObjectStore<T extends ObjectType> = Omit<
  ObjectStore,
  "object"
> & {
  object: ObjectTypeMap[T];
};

export type QueryKey = {
  query: string;
};

export type ResultedScrapeOperation<T> = ScrapeResponse<T> | ErrorResponse;

export type CachedScrape<T = any> = {
  payload: QueryKey;
  data: ResultedScrapeOperation<T>;
};
