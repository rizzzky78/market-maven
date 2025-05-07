import { SharedContent } from "@/components/maven/shared-content";
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
import { NavigationBar } from "@/components/maven/navigation-bar";
import { Footer } from "@/components/maven/footer";

// Constants
const ALLOWED_COMPONENT_TYPES = [
  "product-search",
  "product-details",
  "products-comparison",
  "public-chat",
] as const;

// Types
type AllowedComponentType = (typeof ALLOWED_COMPONENT_TYPES)[number];

interface SearchParams {
  type?: string;
  "component-id"?: string;
  "reff-id"?: string;
}

interface SharePageProps {
  searchParams: Promise<SearchParams>;
}

// Validation schemas
const uuidV4Schema = z.string().uuid();

// Helper functions
const validateShareParams = (
  type?: string,
  componentId?: string,
  referenceId?: string
): {
  isValid: boolean;
  validatedType?: ComponentType;
  validatedComponentId?: string;
} => {
  const isValidType =
    type && ALLOWED_COMPONENT_TYPES.includes(type as AllowedComponentType);
  const isValidComponentId =
    componentId && uuidV4Schema.safeParse(componentId).success;

  if (isValidType && isValidComponentId && referenceId) {
    return {
      isValid: true,
      validatedType: type as ComponentType,
      validatedComponentId: componentId,
    };
  }

  return { isValid: false };
};

const fetchContentData = async (type: ComponentType, componentId: string) => {
  return type === "public-chat"
    ? await getChat(componentId)
    : await getToolDataEntryByKey(componentId);
};

const generatePageTitle = async (
  type?: string,
  componentId?: string
): Promise<string> => {
  const defaultTitle = "Maven Shared Content";

  if (!type || !componentId) {
    return defaultTitle;
  }

  try {
    if (type === "public-chat") {
      const chatData = await getChat(componentId);
      return chatData?.title ?? defaultTitle;
    }

    const toolData = await getToolDataEntryByKey(componentId);
    if (!toolData) {
      return defaultTitle;
    }

    const chatData = await getChat(toolData.chatId);
    return chatData?.title ?? defaultTitle;
  } catch {
    return defaultTitle;
  }
};

// Metadata generator
export const generateMetadata = async ({
  searchParams,
}: SharePageProps): Promise<Metadata> => {
  const { type, "component-id": componentId } = await searchParams;
  const title = await generatePageTitle(type, componentId);

  return { title };
};

// Main component
export default async function SharePage({ searchParams }: SharePageProps) {
  const {
    type,
    "component-id": componentId,
    "reff-id": referenceId,
  } = await searchParams;

  // Validate parameters
  const { isValid, validatedType, validatedComponentId } = validateShareParams(
    type,
    componentId,
    referenceId
  );

  if (!isValid || !validatedType || !validatedComponentId || !referenceId) {
    return <ShareNotFound />;
  }

  // Fetch share record
  const shareRecord = await getShareByReferenceId(referenceId);
  if (!shareRecord) {
    return <ShareNotFound />;
  }

  // Increment access count
  await incrementShareAccess(referenceId);

  // Fetch content data
  const contentData = await fetchContentData(
    validatedType,
    validatedComponentId
  );
  if (!contentData) {
    return <ShareNotFound />;
  }

  return (
    <div>
      <NavigationBar />
      <div className="min-h-screen flex flex-col">
        <main className="px-2 sm:px-12 md:pt-8 max-w-[484px] md:max-w-3xl w-full mx-auto flex flex-col space-y-3 md:space-y-4 flex-grow">
          <section className="bg-[#1A1A1D] dark:bg-white rounded-3xl py-4 px-6 mt-16 mb-6">
            <div className="flex flex-col">
              <h2 className="font-[family-name:var(--font-khand)] text-2xl font-semibold text-white/90 dark:text-black/90">
                Shared Content
              </h2>
              <div className="flex items-start">
                <Info className="size-4 shrink-0 lg:mt-1.5 mr-1 text-purple-500" />
                <p className="text-lg text-white/80 dark:text-black/80 font-[family-name:var(--font-khand)]">
                  You are currently viewing the shared content, please go to the
                  <Link
                    href="/chat"
                    className="mx-1 underline text-purple-300 dark:text-purple-500 hover:no-underline hover:text-purple-500 dark:hover:text-purple-600"
                  >
                    App
                  </Link>
                  for more features.
                </p>
              </div>
            </div>
          </section>
          <SharedContent type={validatedType} data={contentData} />
        </main>
      </div>
      <Footer />
    </div>
  );
}
