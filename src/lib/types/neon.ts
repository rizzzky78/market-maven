import { ScrapeResponse } from "@mendable/firecrawl-js";
import { ErrorResponse } from "./firecrawl";

/**
 * Represents the supported types of markdown data.
 */
export type MarkdownType = "product-search" | "product-details";

/**
 * Represents stored markdown data and defines the schema for markdown storage.
 *
 * @template T - The type of markdown data (defaults to `MarkdownType`).
 */
export type MarkdownStore<T = MarkdownType> = {
  /**
   * A UUID that serves as the primary key for accessing the data.
   * This value is provided manually via the API.
   */
  key: string;
  /**
   * The chat identifier associated with this markdown data.
   * This value is provided manually via the API.
   */
  chatId: string;
  /**
   * The identifier of the owner of the markdown data.
   * This value is provided manually via the API.
   */
  owner: string;
  /**
   * The timestamp indicating when the data was created.
   * This is managed automatically by the database.
   */
  timestamp: string;
  /**
   * The type of markdown data stored.
   */
  type: T;
  /**
   * The raw markdown content obtained from a scrape result.
   * This content is stored without any stringification or modification.
   */
  markdown: string;
};

/**
 * Data Transfer Object (DTO) representing the payload to store markdown data via the API.
 */
export type MarkdownStoreDTO = {
  key: string;
  chatId: string;
  owner: string;
  type: MarkdownType;
  markdown: string;
};

/**
 * Represents the supported object operation types.
 */
export type ObjectType =
  | "searchProduct"
  | "getProductDetails"
  | "productsComparison";

/**
 * Represents stored object data.
 *
 * @template T - The type of the contained object data.
 */
export type ObjectStore<T = Record<string, any>> = {
  /**
   * A UUID that serves as the primary key for accessing the data.
   * This value is provided manually via the API.
   */
  key: string;
  /**
   * The chat identifier associated with this object data.
   * This value is provided manually via the API.
   */
  chatId: string;
  /**
   * The identifier of the owner of the object data.
   * This value is provided manually via the API.
   */
  owner: string;
  /**
   * The timestamp indicating when the data was created.
   * This is managed automatically by the database.
   */
  timestamp: string;
  /**
   * The type of object data stored.
   */
  type: ObjectType;
  /**
   * The actual object data.
   */
  object: T;
};

/**
 * A strongly typed version of the {@link ObjectStore} type.
 *
 * @template T - The specific type for the contained object data.
 */
export type TypedObjectStore<T> = Omit<ObjectStore, "object"> & {
  object: T;
};

/**
 * Represents a query key used in scraping operations.
 */
export type QueryKey = {
  /** A query input */
  query: string;
  /** UUID string */
  key: string;
};

/**
 * Represents the result of a scraping operation, which can either be a successful scrape response
 * or an error response.
 *
 * @template T - The type of data returned on a successful scrape.
 */
export type ResultedScrapeOperation<T> = ScrapeResponse<T> | ErrorResponse;

/**
 * Represents a cached scrape operation, including both the query key payload and its associated data.
 *
 * @template T - The type of data associated with the scrape operation.
 */
export type CachedScrape<T = any> = {
  /**
   * The payload containing the query key.
   */
  payload: QueryKey;
  /**
   * The data resulting from the scrape operation.
   */
  data: ResultedScrapeOperation<T>;
};

export type CacheResultedScrape<T> = {
  /** A type represent is data are cached or not cached, `true` if cached othwerise is not cached */
  cached: boolean;
  /** The cached scrape response from scrapeFn */
  response: CachedScrape<T>;
};

/**
 * Generic interface representing a data store for tool operations.
 *
 * @template ARGS - The type of arguments passed to the tool.
 * @template DATA - The type of data returned by the tool.
 */
export type ToolDataStore<ARGS = unknown, DATA = unknown> = {
  /**
   * A UUID that serves as the primary key for accessing the stored data.
   */
  key: string;
  /**
   * The chat identifier associated with this data.
   */
  chatId: string;
  /**
   * The identifier for the owner of the data.
   */
  owner: string;
  /**
   * The timestamp indicating when the record was created.
   * This is managed automatically by the database.
   */
  timestamp: Date;
  /**
   * Information specific to the tool operation.
   */
  tool: {
    /**
     * Indicates whether the tool operation was successful.
     */
    success: boolean;
    /**
     * The name of the tool.
     */
    name: string;
    /**
     * The arguments passed to the tool.
     */
    args: ARGS;
    /**
     * The data returned by the tool.
     */
    data: DATA;
  };
};
