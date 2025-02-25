import { ExtendedToolResult } from "./ai";
import { ProductDetailsResponse } from "./product";

/**
 * Reusable Component Props
 */

export type ProductDetailsProps = {
  content: ExtendedToolResult<
    { query: string; link: string },
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
};
