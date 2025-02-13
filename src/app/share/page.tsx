import { mapUIState } from "@/components/custom/ui-mapper";
import { FooterSharedContent } from "@/components/maven/footer-shared-content";
import { MapSharedContent } from "@/components/maven/map-shared-content";
import { ProductComparison } from "@/components/maven/product-comparison";
import { ProductDetails } from "@/components/maven/product-details";
import { ProductSearch } from "@/components/maven/product-search";
import { ShareNotFound } from "@/components/maven/share-not-found";
import { getChat } from "@/lib/agents/action/chat-service";
import {
  getShareByReferenceId,
  incrementShareAccess,
} from "@/lib/service/share-analytics";
import { getObjectEntry, getToolDataEntryByKey } from "@/lib/service/store";
import { ChatProperties } from "@/lib/types/ai";
import { ComponentType } from "@/lib/types/neon";
import {
  ProductDetailsResponse,
  ProductsComparisonResponse,
  ProductsResponse,
} from "@/lib/types/product";
import React, { ReactNode } from "react";
import { z } from "zod";

// Define the allowed types
const allowedTypes = [
  "product-search",
  "product-details",
  "products-comparison",
  "public-chat",
] as const;
type AllowedType = (typeof allowedTypes)[number];

type ComponentSource = {
  "product-search": ProductsResponse;
  "product-details": ProductDetailsResponse;
  "products-comparison": ProductsComparisonResponse;
  "public-chat": ChatProperties;
};

type AllowedTypeMap<T extends AllowedType> = ComponentSource[T];

// Zod schema for UUID v4
const uuidV4Schema = z.string().uuid();

// Define props type
type SharePageProps = {
  searchParams: Promise<{
    type?: string;
    "component-id"?: string;
    "reff-id"?: string;
  }>;
};

export const generateMetadata = async ({ searchParams }: SharePageProps) => {
  const { "component-id": key } = await searchParams;

  if (key) {
    const tool = await getToolDataEntryByKey(key);
    if (tool) {
      const chat = await getChat(tool.chatId);
      return {
        title: chat?.title.toString().slice(0, 50) || "Maven Search",
      };
    }
  }

  return {
    title: "Maven Resulted Content",
  };
};

export default async function SharePage({ searchParams }: SharePageProps) {
  // Await the searchParams
  const {
    type,
    "component-id": componentId,
    "reff-id": reffId,
  } = await searchParams;

  // Validate type and component-id
  const isValidType = type && allowedTypes.includes(type as AllowedType);
  const isValidComponentId =
    componentId && uuidV4Schema.safeParse(componentId).success;

  // If either parameter is invalid, render the CustomNotFound component
  if (!isValidType || !isValidComponentId || !reffId) {
    return <ShareNotFound />;
  }

  const shareRecord = await getShareByReferenceId(reffId);

  if (!shareRecord) {
    return <ShareNotFound />;
  }

  // await incrementShareAccess(reffId)

  const contentData =
    (type as ComponentType) === "public-chat"
      ? await getChat(componentId)
      : await getToolDataEntryByKey(componentId);

  if (!contentData) {
    return <ShareNotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-2 sm:px-12 pt-12 md:pt-20 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-1 md:space-y-4 flex-grow">
        <MapSharedContent type={type as ComponentType} data={contentData} />
      </div>
      <FooterSharedContent />
    </div>
  );
}
