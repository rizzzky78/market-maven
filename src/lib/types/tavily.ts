/**
 * Interface for Search Response.
 */
export interface TavilyResponse {
  /**
   * The original query submitted by the user.
   * @example "OpenAI o1"
   */
  query: string;

  /**
   * Suggested follow-up questions or related queries, if applicable.
   * @example null
   */
  follow_up_questions: string[] | null;

  /**
   * The primary answer or summary of the search query.
   * @example "OpenAI's o1 model has been developed using advanced techniques..."
   */
  answer: string;

  /**
   * A list of image objects related to the search topic.
   */
  images: TavilyImages[];

  /**
   * A list of search results, including links to sources and brief content summaries.
   */
  results: TavilyResult[];

  /**
   * The time taken to generate the search response, in seconds.
   * @example 4.01
   */
  response_time: number;
}

export interface TavilyImages {
  /**
   * The URL of the image.
   * @example "https://media.geeksforgeeks.org/wp-content/uploads/20240913141015/OpenAI-o1-AI-Model-Launched.webp"
   */
  url: string;

  /**
   * A brief description of the image and its relevance.
   * @example "The content presents an announcement of the launch of OpenAI's o1 AI models..."
   */
  description: string;
}

export interface TavilyResult {
  /**
   * The URL of the source document or webpage.
   * @example "https://cyprus-mail.com/2024/11/18/openai-and-others-seek-new-path..."
   */
  url: string;

  /**
   * The title of the source page or document.
   * @example "OpenAI and others seek new path to smarter AI..."
   */
  title: string;

  /**
   * A relevance score for the result, with higher scores indicating closer matches.
   * @example 0.99727446
   */
  score: number;

  /**
   * The publication date of the source content.
   * @example "Mon, 18 Nov 2024 05:30:00 GMT"
   */
  published_date: string;

  /**
   * A brief snippet or summary of the content from the source.
   * @example "A dozenAI scientists, researchers and investors told Reuters..."
   */
  content: string;
}

export type TavilyClientOptions = {
  apiKey?: string;
};

export type TavilySearchOptions = {
  searchDepth?: "basic" | "advanced";
  topic?: "general" | "news" | "finance";
  days?: number;
  maxResults?: number;
  includeImages?: boolean;
  includeImageDescriptions?: boolean;
  includeAnswer?: boolean;
  includeRawContent?: boolean;
  includeDomains?: undefined | Array<string>;
  excludeDomains?: undefined | Array<string>;
  maxTokens?: undefined | number;
};

export type TavilyImage = {
  url: string;
  description?: string;
};

export type TavilySearchResult = {
  title: string;
  url: string;
  content: string;
  rawContent?: string;
  score: number;
  publishedDate?: string;
};

export type TavilySearchResponse = {
  timestamp?: string;
  answer?: string;
  query: string;
  responseTime: number;
  images: Array<TavilyImage>;
  results: Array<TavilySearchResult>;
};

export type TavilySearchResponseTool = TavilySearchResponse | string;

export type TavilyExtractResult = {
  url: string;
  rawContent: string;
};
export type TavilyExtractFailedResult = {
  url: string;
  error: string;
};

export type TavilyExtractResponse = {
  results: Array<TavilyExtractResult>;
  failedResults: Array<TavilyExtractFailedResult>;
  responseTime: number;
};

export type TavilySearchContextResponse = {
  url: string;
  content: string;
};

type TavilySearchFuncton = (
  query: string,
  options: TavilySearchOptions
) => Promise<TavilySearchResponse>;

type TavilyQNASearchFuncton = (
  query: string,
  options: TavilySearchOptions
) => Promise<string>;

type TavilyContextSearchFuncton = (
  query: string,
  options: TavilySearchOptions
) => Promise<string>;

type TavilyExtractFunction = (
  urls: Array<string>
) => Promise<TavilyExtractResponse>;

export type TavilyClient = {
  search: TavilySearchFuncton;
  searchQNA: TavilyQNASearchFuncton;
  searchContext: TavilyContextSearchFuncton;
  extract: TavilyExtractFunction;
};
