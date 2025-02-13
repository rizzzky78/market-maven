import { ChatProperties } from "@/lib/types/ai";
import { ComponentType, ToolDataStore } from "@/lib/types/neon";
import { FC } from "react";
import { mapUIState } from "../custom/ui-mapper";
import { ProductsResponse } from "@/lib/types/product";
import { ProductSearch } from "./product-search";
import { ProductDetails } from "./product-details";
import { ProductComparison } from "./product-comparison";

// Types
interface SharedContentProps {
  type: ComponentType;
  data: ToolDataStore<any, any> | ChatProperties;
}

type ProductSearchData = ToolDataStore<{ query: string }, ProductsResponse>;

type ProductDetailsData = ToolDataStore<
  { query: string; link: string },
  {
    productDetails: Record<string, any>;
    screenshot: string;
    callId: string;
  }
>;

type ProductComparisonData = ToolDataStore<
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

// Helper Components
const ChatContent: FC<{ data: ChatProperties }> = ({ data }) => {
  const ui = mapUIState({
    chatId: "",
    username: "",
    messages: data.messages,
    isSharedPage: true,
  });

  return <div>{ui.map((component) => component.display)}</div>;
};

const ProductSearchContent: FC<{ data: ProductSearchData }> = ({ data }) => (
  <ProductSearch content={data.tool} isSharedContent isFinished />
);

const ProductDetailsContent: FC<{ data: ProductDetailsData }> = ({ data }) => (
  <ProductDetails content={data.tool} isSharedContent />
);

const ProductComparisonContent: FC<{ data: ProductComparisonData }> = ({
  data,
}) => <ProductComparison content={data.tool} isSharedContent />;

// Main Component
export const SharedContent: FC<SharedContentProps> = ({ type, data }) => {
  const renderContent = () => {
    switch (type) {
      case "public-chat":
        return <ChatContent data={data as ChatProperties} />;

      case "product-search":
        return <ProductSearchContent data={data as ProductSearchData} />;

      case "product-details":
        return <ProductDetailsContent data={data as ProductDetailsData} />;

      case "products-comparison":
        return (
          <ProductComparisonContent data={data as ProductComparisonData} />
        );

      default:
        return null;
    }
  };

  return <div>{renderContent()}</div>;
};
