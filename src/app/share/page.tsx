import { ProductSearch } from "@/components/maven/product-search";
import { ShareNotFound } from "@/components/maven/share-not-found";
import { getChat } from "@/lib/agents/action/chat-service";
import {
  getShareByReferenceId,
  incrementShareAccess,
} from "@/lib/service/share-analytics";
import { getObjectEntry, getToolDataEntryByKey } from "@/lib/service/store";
import { ComponentType } from "@/lib/types/neon";
import React from "react";
import { z } from "zod";

// Define the allowed types
const allowedTypes = [
  "product-search",
  "product-details",
  "products-comparison",
  "public-chat",
] as const;
type AllowedType = (typeof allowedTypes)[number];

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

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

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

  const data = await getToolDataEntryByKey(componentId);

  const objectEntry = await getObjectEntry(componentId);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-lg sm:text-xl font-bold mb-4">Share Page</h1>
      <div className="p-4 rounded-md shadow-sm">
        <p className="text-sm mb-2">
          <strong>Type:</strong> {type}
        </p>
        <p className="text-sm">
          <strong>Component ID:</strong> {componentId}
        </p>
      </div>
      <div className="overflow-x-auto">
        <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
