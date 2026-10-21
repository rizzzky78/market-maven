"use client";

import { FC, Fragment } from "react";
import { MavenUIMessage, Streamed, ViewNode } from "@/lib/types/ai";
import {
  AssistantMessage,
  StreamAssistantMessage,
} from "@/components/maven/assistant-message";
import { ErrorMessage } from "@/components/maven/error-message";
import { StreamExtendedMessage } from "@/components/maven/extended-message";
import { InsightProductCard } from "@/components/maven/insight-product-card";
import { InsightProductCardSkeleton } from "@/components/maven/insight-product-card-skeleton";
import { ProductComparison } from "@/components/maven/product-comparison";
import { ProductDetails } from "@/components/maven/product-details";
import { ProductDetailsInsight } from "@/components/maven/product-details-insight";
import { ProductSearch } from "@/components/maven/product-search";
import { QueryEnhancement } from "@/components/maven/query-enhancement";
import { QueryEnhancementSkeleton } from "@/components/maven/query-enhancement-skeleton";
import { QueryValidation } from "@/components/maven/query-validation";
import { QueryValidationSkeleton } from "@/components/maven/query-validation-skeleton";
import {
  RecommendationAction,
  StreamRecommendationAction,
} from "@/components/maven/recommendation-action";
import { RecommendationSkeleton } from "@/components/maven/recommendation-skeleton";
import {
  RelatedMessage,
  StreamRelatedMessage,
} from "@/components/maven/related-message";
import { LoadingText } from "@/components/maven/shining-glass";
import { StreamProductComparison } from "@/components/maven/stream-product-comparison";
import { StreamProductDetails } from "@/components/maven/stream-product-details";
import { StreamProductDetailsInsight } from "@/components/maven/stream-product-details-insight";
import { StreamProductSearch } from "@/components/maven/stream-product-search";
import { UserInquiry } from "@/components/maven/user-inquiry";
import { InquirySkeleton } from "@/components/maven/user-inquiry-skeleton";
import { UserMessage } from "@/components/maven/user-message";

/**
 * Components the server may render into a reply, by the name it uses in
 * `ui()` (see `src/app/server/stream-ui.ts`).
 */
export const viewRegistry = {
  AssistantMessage,
  StreamAssistantMessage,
  ErrorMessage,
  StreamExtendedMessage,
  InsightProductCard,
  InsightProductCardSkeleton,
  ProductComparison,
  ProductDetails,
  ProductDetailsInsight,
  ProductSearch,
  QueryEnhancement,
  QueryEnhancementSkeleton,
  QueryValidation,
  QueryValidationSkeleton,
  RecommendationAction,
  StreamRecommendationAction,
  RecommendationSkeleton,
  RelatedMessage,
  StreamRelatedMessage,
  LoadingText,
  StreamProductComparison,
  StreamProductDetails,
  StreamProductDetailsInsight,
  StreamProductSearch,
  UserInquiry,
  InquirySkeleton,
};

type StreamRef = { $stream: string };

const isStreamRef = (value: unknown): value is StreamRef =>
  typeof value === "object" && value !== null && "$stream" in value;

/** Renders one streamed reply: its latest view with the streamed values. */
const AssistantView: FC<{ message: MavenUIMessage }> = ({ message }) => {
  const streams = new Map<string, Streamed<unknown>>();
  let nodes: ViewNode[] = [];

  for (const part of message.parts) {
    if (part.type === "data-stream" && part.id) streams.set(part.id, part.data);
    if (part.type === "data-view") nodes = part.data;
  }

  return nodes.map(({ component, props }, index) => {
    const Component = viewRegistry[
      component as keyof typeof viewRegistry
    ] as FC<Record<string, unknown>> | undefined;
    if (!Component) return null;

    const resolved = Object.fromEntries(
      Object.entries(props).map(([key, value]) => [
        key,
        isStreamRef(value)
          ? (streams.get(value.$stream) ?? { status: "streaming" })
          : value,
      ])
    );

    return <Component key={`${component}-${index}`} {...resolved} />;
  });
};

/** Renders the messages streamed by `useChat` in this session. */
export const LiveMessages: FC<{ messages: MavenUIMessage[] }> = ({
  messages,
}) =>
  messages.map((message) => (
    <Fragment key={message.id}>
      {message.role === "user" ? (
        message.parts.map((part, index) =>
          part.type === "data-user" ? (
            <UserMessage key={index} content={part.data} />
          ) : null
        )
      ) : (
        <AssistantView message={message} />
      )}
    </Fragment>
  ));
