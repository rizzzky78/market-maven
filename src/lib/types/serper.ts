// --- Inferred Response Types ---

/**
 * Common base structure for a single search result item.
 */
export type BaseSearchResult = {
  /** The title of the search result. */
  title: string;
  /** The direct link to the search result. */
  link: string;
  /** A brief snippet or description of the search result. Optional. */
  snippet?: string;
  /** The rank or position of the search result on the page. */
  position: number;
};

/**
 * Represents a single web search result item, extending the {@link BaseSearchResult}.
 */
export type WebSearchResult = {
  /** The URL displayed for the search result. Optional. */
  displayedLink?: string;
  /** The publication date of the search result, if available. Optional. */
  date?: string;
  /**
   * An array of sitelinks associated with the main result.
   * Sitelinks are additional links appearing under the main search result,
   * pointing to different sections of the same website. Optional.
   */
  sitelinks?: Array<{
    /** The title of the sitelink. */
    title: string;
    /** The URL of the sitelink. */
    link: string;
  }>;
  /** The rating score for the result, if applicable (e.g., for products, recipes). Optional. */
  rating?: number;
  /** The number of ratings received, if applicable. Optional. */
  ratingCount?: number;
} & BaseSearchResult;

/**
 * Represents an item in the "People Also Ask" section of search results.
 */
export type PeopleAlsoAskItem = {
  /** The question being asked. */
  question: string;
  /** A snippet answering the question. */
  snippet: string;
  /** The title of the source page for the answer. */
  title: string;
  /** The link to the source page for the answer. */
  link: string;
};

/**
 * Represents a related search query item.
 */
export type RelatedSearchItem = {
  /** The related search query string. */
  query: string;
};

/**
 * Defines the overall structure of a response from a Serper API web search.
 */
export type SerperWebSearchResponse = {
  /**
   * Parameters used for the search query.
   */
  searchParameters: {
    /** The search query string. */
    q: string;
    /** The type of search performed, e.g., "search". */
    type: "search";
    /** The search engine used, e.g., "google". */
    engine: "google";
    /**
     * Geolocation of the search. Optional.
     * A two-letter country code (e.g., "US" for the United States).
     */
    gl?: string;
    /**
     * Language of the search. Optional.
     * A two-letter language code (e.g., "en" for English).
     */
    hl?: string;
    /**
     * Number of results to return per page. Optional.
     * Default is usually 10.
     */
    num?: number;
    /**
     * The page number of the results. Optional.
     * Default is 1.
     */
    page?: number;
    /**
     * Whether to enable or disable autocorrect for the query. Optional.
     * Default is true.
     */
    autocorrect?: boolean;
    /**
     * Safe search filtering option. Optional.
     * "active": Enables safe search.
     * "off": Disables safe search.
     */
    safe?: "active" | "off";
    /**
     * Advanced search parameters. Optional.
     * This string can contain various parameters to refine search results
     * (e.g., time period, file type).
     */
    tbs?: string;
    /**
     * Filtering options for the search. Optional.
     * '0' for disabling, '1' for enabling duplicate content filtering.
     */
    filter?: string;
  };
  /** An array of organic web search results. Optional. */
  organic?: WebSearchResult[];
  /** An array of "People Also Ask" items. Optional. */
  peopleAlsoAsk?: PeopleAlsoAskItem[];
  /** An array of related search queries. Optional. */
  relatedSearches?: RelatedSearchItem[];
  /**
   * Information from the Google Knowledge Graph. Optional.
   * This can include details about entities like people, places, or organizations.
   */
  knowledgeGraph?: {
    /** The title of the knowledge graph entity. Optional. */
    title?: string;
    /** The type or category of the knowledge graph entity. Optional. */
    type?: string;
    /** A description of the knowledge graph entity. Optional. */
    description?: string;
    /** A URL to an image representing the knowledge graph entity. Optional. */
    imageUrl?: string;
    // ... other knowledge graph fields can be added here
  };
  /** The number of credits consumed by this API request. */
  credits: number;
};

/**
 * Represents a single image search result item.
 */
export type ImageSearchResult = {
  /** The title or caption of the image. */
  title: string;
  /** The direct URL to the full-size image. */
  imageUrl: string;
  /** The width of the full-size image in pixels. */
  imageWidth: number;
  /** The height of the full-size image in pixels. */
  imageHeight: number;
  /** The URL to the thumbnail version of the image. */
  thumbnailUrl: string;
  /** The width of the thumbnail image in pixels. */
  thumbnailWidth: number;
  /** The height of the thumbnail image in pixels. */
  thumbnailHeight: number;
  /** The source website or platform where the image is hosted (e.g., "Wikipedia"). */
  source: string;
  /** The domain name of the website hosting the image. */
  domain: string;
  /** The URL of the webpage where the image is found. */
  link: string;
  /** The Google Images URL for this specific image result. */
  googleUrl: string;
  /** The rank or position of the image result. */
  position: number;
};

/**
 * Defines the overall structure of a response from a Serper API images search.
 */
export type SerperImagesSearchResponse = {
  /**
   * Parameters used for the image search query.
   */
  searchParameters: {
    /** The search query string. */
    q: string;
    /** The type of search performed, e.g., "images". */
    type: "images";
    /** The search engine used, e.g., "google". */
    engine: "google";
    /**
     * Number of image results to return per page. Optional.
     * Default is usually 10 or 20.
     */
    num?: number;
    /**
     * Geolocation of the search. Optional.
     * A two-letter country code (e.g., "US" for the United States).
     */
    gl?: string;
    /**
     * Language of the search. Optional.
     * A two-letter language code (e.g., "en" for English).
     */
    hl?: string;
    /**
     * The page number of the image results. Optional.
     * Default is 1.
     */
    page?: number;
    /**
     * Whether to enable or disable autocorrect for the query. Optional.
     * Default is true.
     */
    autocorrect?: boolean;
    /**
     * Safe search filtering option. Optional.
     * "active": Enables safe search.
     * "off": Disables safe search.
     */
    safe?: "active" | "off";
    /**
     * Advanced search parameters for images. Optional.
     * This string can contain various parameters to refine image search results.
     */
    tbs?: string;
    /**
     * Desired size of the images. Optional.
     * "small", "medium", "large", "xlarge"
     */
    imgSize?: "small" | "medium" | "large" | "xlarge";
    /**
     * Type of image. Optional.
     * "face": Images focusing on faces.
     * "photo": Photographic images.
     * "clipart": Clipart images.
     * "lineart": Line drawings.
     */
    imgType?: "face" | "photo" | "clipart" | "lineart";
    /**
     * Color type of the image. Optional.
     * "color": Full-color images.
     * "gray": Grayscale images.
     * "mono": Black and white images.
     */
    imgColorType?: "color" | "gray" | "mono";
    /**
     * Dominant color to filter images by (e.g., "blue", "green"). Optional.
     */
    imgDominantColor?: string;
  };
  /** An array of image search results. Optional. */
  images?: ImageSearchResult[];
  /** The number of credits consumed by this API request. */
  credits: number;
};

/**
 * Represents a single video search result item, extending the {@link BaseSearchResult}.
 */
export type VideoSearchResult = {
  /** The URL of the thumbnail image for the video. */
  imageUrl: string;
  /**
   * The duration of the video, typically in "HH:MM:SS" or "MM:SS" format. Optional.
   * Example: "1:23:45" or "5:30".
   */
  duration?: string;
  /**
   * The source platform of the video (e.g., "YouTube", "Vimeo"). Optional.
   */
  source?: string;
  /** The date when the video was published. Optional. */
  publishedDate?: string;
} & BaseSearchResult;

/**
 * Defines the overall structure of a response from a Serper API videos search.
 */
export type SerperVideosSearchResponse = {
  /**
   * Parameters used for the video search query.
   */
  searchParameters: {
    /** The search query string. */
    q: string;
    /** The type of search performed, e.g., "videos". */
    type: "videos";
    /** The search engine used, e.g., "google". */
    engine: "google";
    /**
     * Geolocation of the search. Optional.
     * A two-letter country code (e.g., "US" for the United States).
     */
    gl?: string;
    /**
     * Language of the search. Optional.
     * A two-letter language code (e.g., "en" for English).
     */
    hl?: string;
    /**
     * Number of video results to return per page. Optional.
     */
    num?: number;
    /**
     * The page number of the video results. Optional.
     * Default is 1.
     */
    page?: number;
    /**
     * Whether to enable or disable autocorrect for the query. Optional.
     * Default is true.
     */
    autocorrect?: boolean;
    /**
     * Safe search filtering option. Optional.
     * "active": Enables safe search.
     * "off": Disables safe search.
     */
    safe?: "active" | "off";
    /**
     * Advanced search parameters for videos. Optional.
     * This string can contain various parameters to refine video search results.
     */
    tbs?: string;
  };
  /** An array of video search results. Optional. */
  videos?: VideoSearchResult[];
  /** The number of credits consumed by this API request. */
  credits: number;
};

/**
 * Represents a single news search result item, extending the {@link BaseSearchResult}.
 */
export type NewsSearchResult = {
  /** The publication date of the news article. */
  date: string;
  /** The source or publisher of the news article (e.g., "BBC News"). */
  source: string;
  /** The URL of a thumbnail image associated with the news article. Optional. */
  imageUrl?: string;
} & BaseSearchResult;

/**
 * Defines the overall structure of a response from a Serper API news search.
 */
export type SerperNewsSearchResponse = {
  /**
   * Parameters used for the news search query.
   */
  searchParameters: {
    /** The search query string. */
    q: string;
    /** The type of search performed, e.g., "news". */
    type: "news";
    /** The search engine used, e.g., "google". */
    engine: "google";
    /**
     * Geolocation of the search. Optional.
     * A two-letter country code (e.g., "US" for the United States).
     */
    gl?: string;
    /**
     * Language of the search. Optional.
     * A two-letter language code (e.g., "en" for English).
     */
    hl?: string;
    /**
     * Number of news results to return per page. Optional.
     */
    num?: number;
    /**
     * The page number of the news results. Optional.
     * Default is 1.
     */
    page?: number;
    /**
     * Whether to enable or disable autocorrect for the query. Optional.
     * Default is true.
     */
    autocorrect?: boolean;
    /**
     * Safe search filtering option. Optional.
     * "active": Enables safe search.
     * "off": Disables safe search.
     */
    safe?: "active" | "off";
    /**
     * Advanced search parameters for news. Optional.
     * This string can contain various parameters to refine news search results.
     */
    tbs?: string;
    /**
     * Parameter to specify news search type.
     * "nws" indicates a news search.
     */
    tbm?: "nws";
  };
  /** An array of news search results. Optional. */
  news?: NewsSearchResult[];
  /** The number of credits consumed by this API request. */
  credits: number;
};

/**
 * Represents a single shopping search result item.
 */
export type ShoppingSearchResult = {
  /** The title or name of the product. */
  title: string;
  /** The source or retailer of the product (e.g., "Amazon", "eBay"). */
  source: string;
  /** The direct link to the product page. */
  link: string;
  /**
   * The price of the product, as a string.
   * This can include currency symbols, "refurbished", ranges, etc.
   * Example: "$19.99", "£50 - £60", "Used from $25.00".
   */
  price: string;
  /** Information about product delivery (e.g., "Free shipping"). Optional. */
  delivery?: string;
  /** The URL of an image of the product. */
  imageUrl: string;
  /** The average rating of the product. Optional. */
  rating?: number;
  /** The total number of ratings the product has received. Optional. */
  ratingCount?: number;
  /** The rank or position of the shopping result. */
  position: number;
  /** Information about special offers or multiple sellers. Optional. */
  offers?: string;
  /** A unique identifier for the product, if available. Optional. */
  productId?: string;
};

/**
 * Defines the overall structure of a response from a Serper API shopping search.
 */
export type SerperShoppingSearchResponse = {
  /**
   * Parameters used for the shopping search query.
   */
  searchParameters: {
    /** The search query string. */
    q: string;
    /** The type of search performed, e.g., "shopping". */
    type: "shopping";
    /** The search engine used, e.g., "google". */
    engine: "google";
    /**
     * Geolocation of the search. Optional.
     * A two-letter country code (e.g., "US" for the United States).
     */
    gl?: string;
    /**
     * Language of the search. Optional.
     * A two-letter language code (e.g., "en" for English).
     */
    hl?: string;
    /**
     * Number of shopping results to return per page. Optional.
     */
    num?: number;
    /**
     * The page number of the shopping results. Optional.
     * Default is 1.
     */
    page?: number;
    /**
     * Whether to enable or disable autocorrect for the query. Optional.
     * Default is true.
     */
    autocorrect?: boolean;
    /**
     * Safe search filtering option. Optional.
     * "active": Enables safe search.
     * "off": Disables safe search.
     */
    safe?: "active" | "off";
    /**
     * Advanced search parameters for shopping. Optional.
     * This string can contain various parameters to refine shopping search results.
     */
    tbs?: string;
    /**
     * Specifies the location for local shopping results. Optional.
     * Example: "London, UK".
     */
    location?: string;
  };
  /** An array of shopping search results. Optional. */
  shopping?: ShoppingSearchResult[];
  /** The number of credits consumed by this API request. */
  credits: number;
};
