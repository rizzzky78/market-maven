"use client";

import { ChatProperties } from "@/lib/types/ai";
import { ComponentType, ToolDataStore } from "@/lib/types/neon";
import { FC } from "react";
import { mapUIState } from "../custom/ui-mapper";
import { ProductsResponse } from "@/lib/types/product";
import { ProductSearch } from "./product-search";
import { ProductDetails } from "./product-details";
import { ProductComparison } from "./product-comparison";

interface SharedContentProps {
  type: ComponentType;
  data: ToolDataStore<any, any> | ChatProperties;
}

export const MapSharedContent: FC<SharedContentProps> = ({ type, data }) => {
  if (type === "public-chat") {
    const state = data as ChatProperties;
    const ui = mapUIState({
      chatId: "",
      username: "",
      messages: state.messages,
      isSharedPage: true,
    });

    return <div>{ui.map((component) => component.display)}</div>;
  }

  const componentMapper = () => {
    switch (type) {
      case "product-search":
        const propsSearch = data as ToolDataStore<
          { query: string },
          ProductsResponse
        >;
        return <ProductSearch content={propsSearch.tool} isSharedContent />;
      case "product-details":
        const propsDetails = data as ToolDataStore<
          {
            query: string;
            link: string;
          },
          {
            productDetails: Record<string, any>;
            screenshot: string;
            callId: string;
          }
        >;
        return <ProductDetails content={propsDetails.tool} isSharedContent />;
      case "products-comparison":
        const propsComparison = data as ToolDataStore<
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
        return <ProductComparison content={propsComparison.tool} />;
    }
  };

  return <div>{componentMapper()}</div>;
};
