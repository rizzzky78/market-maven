import { ExtendedToolResult } from "./ai";
import {
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
