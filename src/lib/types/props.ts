import { ExtendedToolResult } from "./ai";

/**
 * Reusable Component Props
 */

export type ProductDetailsProps = {
  content: ExtendedToolResult<
    { query: string; link: string },
    { productDetails: Record<string, any>; screenshot: string; callId: string }
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
