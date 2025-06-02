import { ProductsRecommendation } from "../agents/schema/product";
import { RefferenceDataSource } from "./ai";
import { DataSourceInsight } from "./subtools";

export type Store = {
  name: string;
  location: string;
  isOfficial: boolean;
};

export type Product = {
  title: string;
  image: string;
  price: string;
  rating: string | null;
  sold: string | null;
  link: string;
  store: Store;
};

export type ProductsResponse = {
  callId: string;
  screenshot: string;
  data: Product[];
};

export type ProductDetailsResponse = {
  callId: string;
  screenshot: string;
  externalData: { tavily: string | null; markdown: string | null };
  productDetails: Record<string, any>;
};

export type ProductsComparisonResponse = {
  callId: string;
  productImages: string[];
  comparison: Record<string, any>;
};

export type RecommendationResponse = {
  callId: string;
  recommendations: ProductsRecommendation["recommendations"];
};

export type TokopediaSearchResult = {
  screenshot: string;
  products: Product[];
};

/**
 * Note: global are considered shoppe data source
 */
export type GlobalSearchResult = DataSourceInsight["data"];

export type ExtendedSearchResult = TokopediaSearchResult & GlobalSearchResult;

/**
 * Part of: Search Product result with data source: tokopedia or global
 */
export type SearchProductResult<
  T = TokopediaSearchResult | GlobalSearchResult
> = {
  source?: RefferenceDataSource;
  callId: string;
  object: T;
};

export type ProductDetails<T = DetailsTokopedia | DetailsGlobal> = {
  source?: RefferenceDataSource;
  callId: string;
  object: {
    /** External data sources and content */
    externalData?: ExternalDataSources;
    /** Dynamic product details as key-value pairs */
    productDetails: Record<string, any>;
  } & T;
};

export type DetailsTokopedia = {
  /** Base64 encoded screenshot or screenshot URL */
  screenshot: string;
};

export type DetailsGlobal = {
  /** Reference to previously processed product data */
  previousData: ProductReference;
  /** Collection of media content snapshots */
  snapshots: MediaSnapshots;
  /** Raw markdown from researcher */
  markdown: string;
};

/**
 * External data sources containing search results and formatted content
 */
export type ExternalDataSources = {
  /** Search results from Tavily API */
  tavily: string;
  /** Formatted markdown content */
  markdown: string;
};

/**
 * Media content snapshots including images and videos
 */
export type MediaSnapshots = {
  /** Array of image URLs or base64 encoded images */
  images: string[];
  /** Array of video URLs or identifiers */
  videos: string[];
};

/**
 * Reference information for a previously processed product
 */
export type ProductReference = {
  /** Display title of the referenced product */
  title: string;
  /** Estimated price in string format (e.g., "$29.99") */
  estimatedPrice: string;
  /** Call ID that this data references */
  referenceCallId: string;
};

/**
 * Tool result containing basic product details with screenshot
 */
export type ProductDetailsToolResult = {
  /** Unique identifier for this tool call */
  callId: string;
  /** Base64 encoded screenshot or screenshot URL */
  screenshot: string;
  /** External data sources and content */
  externalData: ExternalDataSources;
  /** Dynamic product details as key-value pairs */
  productDetails: Record<string, any>;
};

/**
 * Enhanced tool result with insights, including previous data and media snapshots
 */
export type ProductDetailsInsightToolResult = {
  /** Unique identifier for this tool call */
  callId: string;
  /** Reference to previously processed product data */
  previousData: ProductReference;
  /** Collection of media content snapshots */
  snapshots: MediaSnapshots;
  /** External data sources and content */
  externalData: ExternalDataSources;
  /** Dynamic product details as key-value pairs */
  productDetails: Record<string, any>;
};

/**
 * Union type representing all possible tool result variations
 */
export type UnionProductDetails =
  | ProductDetailsToolResult
  | ProductDetailsInsightToolResult;

export type ExtendedProductDetails = ProductDetailsToolResult &
  ProductDetailsInsightToolResult;

export type ComparisonData = {
  callId: string;
  object: {
    userIntent?: string;
    comparison: Record<string, any>;
  };
};
