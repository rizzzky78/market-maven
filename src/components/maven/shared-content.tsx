import { ChatProperties, RefferenceDataSource } from "@/lib/types/ai";
import { ComponentType, ToolDataStore } from "@/lib/types/neon";
import { FC, Fragment } from "react";
import { mapUIState } from "../custom/ui-mapper";
import { ProductDetailsResponse } from "@/lib/types/product";
import { ProductSearch } from "./product-search";
import { ProductDetails } from "./product-details";
import { ProductComparison } from "./product-comparison";
import { InsightProductCard } from "./insight-product-card";

// Types
interface SharedContentProps {
  type: ComponentType;
  data: ToolDataStore<any, any> | ChatProperties;
}

type ProductSearchData = ToolDataStore<
  { query: string; reffSource: RefferenceDataSource },
  any
>;

type ProductDetailsData = ToolDataStore<
  { query: string; link: string },
  ProductDetailsResponse
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
    chatId: data.chatId,
    username: data.userId,
    messages: data.messages,
    isSharedPage: true,
  });

  return (
    <div className="space-y-6">
      {ui.map((component) => (
        <Fragment key={component.id}>{component.display}</Fragment>
      ))}
    </div>
  );
};

const ProductSearchContent: FC<{ data: ProductSearchData }> = ({ data }) =>
  data.tool.args.reffSource === "tokopedia" ? (
    <ProductSearch content={data.tool} isSharedContent isFinished />
  ) : (
    <InsightProductCard content={data.tool} isSharedContent />
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

  return (
    <div className="pb-[300px] *:!font-[family-name:var(--font-satoshi)]">
      {renderContent()}
    </div>
  );
};
