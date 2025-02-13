import { FooterSharedContent } from "@/components/maven/footer-shared-content";
import { MapSharedContent } from "@/components/maven/map-shared-content";
import { ShareNotFound } from "@/components/maven/share-not-found";
import { getChat } from "@/lib/agents/action/chat-service";
import {
  getShareByReferenceId,
  incrementShareAccess,
} from "@/lib/service/share-analytics";
import { getToolDataEntryByKey } from "@/lib/service/store";
import { ComponentType } from "@/lib/types/neon";
import { Info } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
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

const generateTitle = async (type?: string, key?: string): Promise<string> => {
  if (type && key) {
    if (type === "public-chat") {
      const chatProp = await getChat(key);
      if (chatProp) {
        return chatProp.title;
      }
    } else {
      const prop = await getToolDataEntryByKey(key);
      if (prop) {
        const cProp = await getChat(prop.chatId);
        if (cProp) {
          return cProp.title;
        }
      }
    }
  }

  return "Maven Shared Content";
};

export const generateMetadata = async ({
  searchParams,
}: SharePageProps): Promise<Metadata> => {
  const { type, "component-id": key } = await searchParams;

  const title = await generateTitle(type, key);

  return {
    title,
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

  await incrementShareAccess(reffId);

  const contentData =
    (type as ComponentType) === "public-chat"
      ? await getChat(componentId)
      : await getToolDataEntryByKey(componentId);

  if (!contentData) {
    return <ShareNotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-2 sm:px-12 pt-5 md:pt-8 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4 flex-grow">
        <div className="bg-[#1A1A1D] dark:bg-white rounded-3xl py-4 px-6 mb-6">
          <div className="flex flex-col">
            <h2 className="text-md font-semibold text-white/90 dark:text-black/90">
              Shared Content
            </h2>
            <div className="flex items-start">
              <Info className="size-4 shrink-0 mr-1 text-purple-400" />
              <p className="text-xs text-white/80 dark:text-black/80">
                You are currently viewing the shared content, please go to the
                <Link
                  href={"/chat"}
                  className="mx-1 underline text-purple-300 dark:text-purple-400 hover:no-underline hover:text-purple-500 dark:hover:text-purple-600"
                >
                  App
                </Link>
                for more features.
              </p>
            </div>
          </div>
        </div>
        <MapSharedContent type={type as ComponentType} data={contentData} />
      </div>
      <FooterSharedContent />
    </div>
  );
}
