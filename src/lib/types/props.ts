import { ExtendedToolResult } from "./ai";
import { ProductDetailsResponse, RecommendationResponse } from "./product";

/**
 * Reusable Component Props
 */

export type ProductDetailsProps = {
  content: ExtendedToolResult<
    { query: string; link: string; source: "tokopedia" | "global" },
    ProductDetailsResponse
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
    {
      callId: string;
      productImages: string[];
      comparison: Record<string, any>;
    }
  >;
  isSharedContent?: boolean;
  skeleton?: boolean;
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
