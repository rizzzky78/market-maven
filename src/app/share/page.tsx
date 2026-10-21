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
  const chatTitle = await generatePageTitle(type, componentId);
  const title = `${chatTitle} | Shared Content - Maven AI`;

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
        <main className="mx-auto flex w-full max-w-3xl grow flex-col space-y-3 px-4 sm:px-6 md:space-y-4 md:pt-8">
          <section className="mt-24 mb-6 flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 font-(family-name:--font-satoshi) sm:flex-row sm:items-center sm:justify-between lg:mt-16 md:mb-8">
            <div className="flex items-start gap-2.5">
              <Info
                className="mt-0.5 size-4 shrink-0 text-brand"
                aria-hidden
              />
              <div>
                <h1 className="text-sm font-medium">Shared from Maven</h1>
                <p className="text-sm text-muted-foreground">
                  This is a read-only copy. Open the app to ask your own
                  questions.
                </p>
              </div>
            </div>
            <Link
              href="/chat"
              className="inline-flex h-9 shrink-0 items-center justify-center self-start rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:self-auto"
            >
              Open Maven
            </Link>
          </section>
          <SharedContent type={validatedType} data={contentData} />
        </main>
      </div>
      <Footer />
    </div>
  );
}
