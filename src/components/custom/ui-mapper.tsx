import { ReactNode } from "react";
import {
  AIState,
  MessageProperty,
  UIState,
  AvailableTool,
  ExtendedToolResult,
  UserContentMessage,
  RefferenceDataSource,
} from "@/lib/types/ai";
import { AssistantMessage } from "../maven/assistant-message";
import { UserMessage } from "../maven/user-message";
import { ToolContent } from "ai";
import { Inquiry } from "@/lib/agents/schema/tool-parameters";
import { UserInquiry, UserInquiryShared } from "../maven/user-inquiry";
import { ProductSearch } from "../maven/product-search";
import { ProductDetails } from "../maven/product-details";
import { ProductComparison } from "../maven/product-comparison";
import { ProductRecommendationProps } from "@/lib/types/props";
import {
  RecommendationAction,
  TemplateRecommendationAction,
} from "../maven/recommendation-action";
import { InsightProductCard } from "../maven/insight-product-card";
import { ProductDetailsInsight } from "../maven/product-details-insight";

/**
 * Core message content structure representing different types of content in the system
 */
interface MessageContent {
  type: string;
  text?: string;
  data?: string;
  image?: string;
  toolName?: AvailableTool;
  result?: string;
}

/**
 * Represents a single item in the UI state with a unique identifier and display component
 */
interface UIStateItem {
  id: string;
  display: ReactNode;
}

/**
 * Type definitions for tool results to ensure type safety
 */
type ProductSearchResult<T = any> = ExtendedToolResult<
  { query: string; reffSource: RefferenceDataSource },
  T
>;

type UserInquiryResult = ExtendedToolResult<Inquiry, { data: string }>;

/**
 * Generates a unique identifier for UI state items
 * @param baseId - Base identifier string
 * @param index - Numeric index for uniqueness
 * @returns Concatenated unique identifier
 */
const generateUniqueId = (baseId: string, index: number): string =>
  `${baseId}-${index}`;

const handleRecommendator = (
  result: string,
  id: string,
  isSharedPage?: boolean
) => {
  const recommendations: ProductRecommendationProps["content"] =
    JSON.parse(result);
  return {
    id,
    display: isSharedPage ? (
      <TemplateRecommendationAction content={recommendations} />
    ) : (
      <RecommendationAction content={recommendations} />
    ),
  };
};

/**
 * Handles product search tool results and generates corresponding UI components
 */
const handleProductSearch = (
  result: string,
  id: string,
  isSharedPage?: boolean
): UIStateItem => {
  const searchResult: ProductSearchResult = JSON.parse(result);

  const isTokopedia = searchResult.args.reffSource === "tokopedia";

  return {
    id,
    display: isTokopedia ? (
      <ProductSearch
        key={id}
        content={searchResult}
        isFinished
        isSharedContent={isSharedPage}
      />
    ) : (
      <InsightProductCard
        content={searchResult}
        isSharedContent={isSharedPage}
      />
    ),
  };
};

/**
 * Handles product details tool results and generates corresponding UI components
 */
const handleGetProductDetails = (
  id: string,
  result: string,
  isSharedPage?: boolean
): UIStateItem => {
  const detailsResult = JSON.parse(result);
  const isTokopedia = detailsResult.source === "tokopedia";
  return {
    id,
    display: isTokopedia ? (
      <ProductDetails content={detailsResult} isSharedContent={isSharedPage} />
    ) : (
      <ProductDetailsInsight
        content={detailsResult}
        isSharedContent={isSharedPage}
      />
    ),
  };
};

/**
 * Handles product comparison tool results and generates corresponding UI components
 */
const handleProductsComparison = (
  id: string,
  result: string,
  isSharedPage?: boolean
): UIStateItem => {
  const comparisonResult = JSON.parse(result);
  return {
    id,
    display: (
      <ProductComparison
        content={comparisonResult}
        isSharedContent={isSharedPage}
      />
    ),
  };
};

/**
 * Handles user inquiry tool results and generates corresponding UI components
 */
const handleInquireUser = (
  id: string,
  result: string,
  isSharedPage?: boolean
): UIStateItem => {
  const inquiryResult: UserInquiryResult = JSON.parse(result);
  return {
    id,
    display: isSharedPage ? (
      <UserInquiryShared inquiry={inquiryResult.args.inquiry} />
    ) : (
      <UserInquiry inquiry={inquiryResult.args.inquiry} />
    ),
  };
};

/**
 * Maps tool results to their corresponding handler functions
 */
const toolResultHandlers: Record<
  AvailableTool,
  (id: string, result: string, isSharedPage?: boolean) => UIStateItem
> = {
  recommendator: (id, result, isSharedPage) =>
    handleRecommendator(result, id, isSharedPage),
  searchProduct: (id, result, isSharedPage) =>
    handleProductSearch(result, id, isSharedPage),
  getProductDetails: (id, result, isSharedPage) =>
    handleGetProductDetails(id, result, isSharedPage),
  productsComparison: (id, result, isSharedPage) =>
    handleProductsComparison(id, result, isSharedPage),
  inquireUser: (id, result, isSharedPage) =>
    handleInquireUser(id, result, isSharedPage),
};

/**
 * Processes tool results and returns appropriate UI components
 */
const handleToolResult = (
  toolContent: MessageContent,
  id: string,
  isSharedPage?: boolean
): UIStateItem => {
  const handler =
    toolContent.toolName && toolResultHandlers[toolContent.toolName];
  return handler
    ? handler(id, toolContent.result || "", isSharedPage)
    : { id, display: null };
};

/**
 * Maps different content types to their corresponding UI handlers
 */
const contentTypeHandlers: Record<
  string,
  (content: MessageContent, id: string) => UIStateItem | null
> = {
  text: (content, id) =>
    content.text
      ? { id, display: <AssistantMessage content={content.text} /> }
      : null,
  file: () => null,
  image: () => null,
  "tool-call": () => null,
  "tool-result": (content, id) => handleToolResult(content, id),
};

/**
 * Processes an array of content items and returns corresponding UI state items
 */
const processContentArray = (
  content: MessageContent[],
  baseId: string,
  defaultHandler: (content: MessageContent, id: string) => UIStateItem | null
): UIState => {
  return content
    .map((item, index) => {
      const id = generateUniqueId(baseId, index);
      const handler = contentTypeHandlers[item.type] || defaultHandler;
      return handler(item, id);
    })
    .filter((item): item is UIStateItem => item !== null);
};

/**
 * Handles different message roles and returns appropriate UI state
 */
const roleHandlers: Record<
  MessageProperty["role"],
  (message: MessageProperty, index: number, isSharedPage?: boolean) => UIState
> = {
  assistant: (message, index) => {
    if (!Array.isArray(message.content)) {
      return [
        {
          id: generateUniqueId(message.id, index),
          display: <AssistantMessage content={message.content as string} />,
        },
      ];
    }
    return processContentArray(
      message.content as MessageContent[],
      message.id,
      (content, id) => ({
        id,
        display: <AssistantMessage content={content as unknown as string} />,
      })
    );
  },

  user: (message, index) => {
    if (!Array.isArray(message.content)) {
      const userContent: UserContentMessage = JSON.parse(message.content);
      return [
        { id: message.id, display: <UserMessage content={userContent} /> },
      ];
    }
    return processContentArray(
      message.content as MessageContent[],
      message.id,
      (content, id) => {
        const userContent: UserContentMessage = JSON.parse(
          content as unknown as string
        );
        return { id, display: <UserMessage content={userContent} /> };
      }
    );
  },

  tool: (message, index, isSharedPage) => {
    if (!Array.isArray(message.content)) return [];
    const toolContent = message.content as unknown as ToolContent;
    const handler =
      toolContent[0].toolName &&
      toolResultHandlers[toolContent[0].toolName as AvailableTool];
    return handler
      ? [handler(message.id, toolContent[0].result as string, isSharedPage)]
      : [];
  },

  system: () => [],
};

/**
 * Main function to map AI state to UI state
 * @param state - Current AI state
 * @returns Array of UI state items
 */
export const mapUIState = (state: AIState): UIState => {
  const messages = Array.isArray(state.messages) ? state.messages : [];
  return messages.flatMap((message, index) =>
    roleHandlers[message.role](message, index, state.isSharedPage)
  );
};
