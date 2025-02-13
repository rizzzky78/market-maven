import { ReactNode } from "react";
import {
  AIState,
  MessageProperty,
  UIState,
  AvailableTool,
  ExtendedToolResult,
  UserContentMessage,
} from "@/lib/types/ai";
import { ProductsResponse } from "@/lib/types/product";
import { AssistantMessage } from "../maven/assistant-message";
import { UserMessage } from "../maven/user-message";
import { ToolContent } from "ai";
import { Inquiry } from "@/lib/agents/schema/tool-parameters";
import { UserInquiry } from "../maven/user-inquiry";
import { ProductSearch } from "../maven/product-search";
import { ProductDetails } from "../maven/product-details";
import { ProductComparison } from "../maven/product-comparison";

// Core message content types based on the existing system
type MessageContent = {
  type: string;
  text?: string;
  data?: string;
  image?: string;
  toolName?: AvailableTool;
  result?: string;
};

// UI State item type
type UIStateItem = {
  id: string;
  display: ReactNode;
};

// Generate unique IDs
const generateUniqueId = (baseId: string, index: number): string =>
  `${baseId}-${index}`;

// Type-safe handler for tool results
const handleProductSearch = (result: string, id: string): UIStateItem => {
  const resulted_searchProduct: ExtendedToolResult<
    { query: string },
    ProductsResponse
  > = JSON.parse(result);
  return {
    id,
    display: (
      <ProductSearch key={id} content={resulted_searchProduct} isFinished />
    ),
  };
};

const handleGetProductDetails = (id: string, result: string): UIStateItem => {
  const resulted_getProductDetails: ExtendedToolResult<
    { link: string; query: string },
    { productDetails: Record<string, any>; screenshot: string; callId: string }
  > = JSON.parse(result);
  return {
    id,
    display: <ProductDetails content={resulted_getProductDetails} />,
  };
};

const handleProductsComparison = (id: string, result: string): UIStateItem => {
  const resulted_productsComparison: ExtendedToolResult<
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
  > = JSON.parse(result);
  return {
    id,
    display: <ProductComparison content={resulted_productsComparison} />,
  };
};

const handleInquireUser = (id: string, result: string): UIStateItem => {
  const resulted_inquireUser: ExtendedToolResult<
    { inquiry: Inquiry },
    { data: string }
  > = JSON.parse(result);
  return {
    id,
    display: (
      <UserInquiry inquiry={resulted_inquireUser.args.inquiry.inquiry} />
    ),
  };
};

// Handle tool results with proper typing
const handleToolResult = (
  toolContent: MessageContent,
  id: string
): UIStateItem => {
  switch (toolContent.toolName) {
    case "searchProduct":
      return handleProductSearch(toolContent.result || "", id);
    case "getProductDetails":
      return handleGetProductDetails(id, toolContent.result || "");
    case "productsComparison":
      return handleProductsComparison(id, toolContent.result || "");
    default:
      return {
        id,
        display: null,
      };
  }
};

// Type-safe content handlers
const contentTypeHandlers: Record<
  string,
  (content: MessageContent, id: string) => UIStateItem | null
> = {
  text: (content, id) =>
    content.text
      ? {
          id,
          display: <AssistantMessage content={content.text} />,
        }
      : null,

  file: (content, id) => null,

  image: (content, id) => null,

  "tool-call": (content, id) => null,

  "tool-result": (content, id) => handleToolResult(content, id),
};

// Process content arrays with type safety
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

// Type-safe role handlers
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
        {
          id: message.id,
          display: <UserMessage content={userContent} />,
        },
      ];
    }
    return processContentArray(
      message.content as MessageContent[],
      message.id,
      (content, id) => {
        const userContent: UserContentMessage = JSON.parse(
          content as unknown as string
        );
        return {
          id,
          display: <UserMessage content={userContent} />,
        };
      }
    );
  },

  tool: (message) => {
    if (!Array.isArray(message.content)) return [];
    const toolContent = message.content as unknown as ToolContent;
    switch (toolContent[0].toolName as AvailableTool) {
      case "searchProduct":
        return [
          handleProductSearch(toolContent[0].result as string, message.id),
        ];
      case "getProductDetails":
        return [
          handleGetProductDetails(message.id, toolContent[0].result as string),
        ];
      case "inquireUser":
        return [handleInquireUser(message.id, toolContent[0].result as string)];
      case "productsComparison":
        return [
          handleProductsComparison(message.id, toolContent[0].result as string),
        ];
      default:
        return [];
    }
  },

  system: () => [], // Handle system messages (usually ignored in UI)
};

// Main mapping function with proper typing
export const mapUIState = (state: AIState): UIState => {
  const messages = Array.isArray(state.messages) ? state.messages : [];
  return messages.flatMap((message, index) =>
    roleHandlers[message.role](message, index)
  );
};
