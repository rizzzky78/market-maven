import { ExtendedToolResult } from "./ai";
import {
  ComparisonData,
  DetailsTokopedia,
  ProductDetails,
  RecommendationResponse,
} from "./product";

/**
 * Reusable Component Props
 */

export type ProductDetailsProps = {
  content: ExtendedToolResult<
    {
      query: string;
      link?: string;
      callId: string;
      source: "tokopedia" | "global";
    },
    ProductDetails<DetailsTokopedia>
  >;
  isSharedContent?: boolean;
};

export type ProductsComparisonProps = {
  content: ExtendedToolResult<
    {
      compare: Array<{
        title: string;
        callId: string;
      }>;
    },
    ComparisonData
  >;
  isSharedContent?: boolean;
};

export type ProductRecommendationProps = {
  content: ExtendedToolResult<
    {
      intent: string;
      scope: string[];
    },
    RecommendationResponse
  >;
};
