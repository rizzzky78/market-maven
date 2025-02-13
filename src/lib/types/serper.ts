/**
 * Base configuration for Serper API requests
 */
export type SerperConfig = {
  /** Serper API key */
  apiKey: string;
  /** Base URL for Serper API */
  baseUrl?: string;
};

/**
 * Common parameters shared across all search types
 * @interface CommonSearchParams
 */
export type CommonSearchParams = {
  /** Search query string */
  q: string;
  /** Number of results to return */
  num?: number;
};

/**
 * Parameters specific to web search
 * @interface WebSearchParams
 */
export type WebSearchParams = CommonSearchParams & {
  /** Start index for pagination */
  start?: number;
  /** Search result type */
  type?: "search";
};

/**
 * Parameters specific to image search
 * @interface ImageSearchParams
 */
export type ImageSearchParams = CommonSearchParams & {
  /** Search result type */
  type: "images";
  /** Image size filter */
  imageSize?:
    | "huge"
    | "icon"
    | "large"
    | "medium"
    | "small"
    | "xlarge"
    | "xxlarge";
  /** Image type filter */
  imageType?: "clipart" | "face" | "lineart" | "news" | "photo";
};

/**
 * Parameters specific to news search
 * @interface NewsSearchParams
 */
export type NewsSearchParams = CommonSearchParams & {
  /** Search result type */
  type: "news";
  /** Time range for news articles */
  timeRange?: "1d" | "1w" | "1m" | "1y";
};

/**
 * Parameters specific to places search
 * @interface PlacesSearchParams
 */
export type PlacesSearchParams = CommonSearchParams & {
  /** Search result type */
  type: "places";
  /** Location to search around */
  location?: string;
};

/**
 * Union type of all possible search parameters
 * @type SerperSearchParams
 */
export type SerperSearchParams =
  | WebSearchParams
  | ImageSearchParams
  | NewsSearchParams
  | PlacesSearchParams;
