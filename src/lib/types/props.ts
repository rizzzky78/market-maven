import { ExtendedToolResult } from "./ai";

/**
 * Reusable Component Props
 */

export type ProductDetailsProps = {
  content: ExtendedToolResult<
    { query: string; link: string },
    { productDetails: Record<string, any>; screenshot: string; callId: string }
  >;
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
      comparison: Record<string, any>
    }
  >;
};

type Example = ExtendedToolResult<
  {
    compare: Array<{
      title: string;
      callId: string;
    }>;
  },
  {
    images: [string, string];
    comparison: {
      products: Record<string, any>[];
      differences: Record<string, any>;
    };
  }
>;
