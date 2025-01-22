import { CoreMessage, LanguageModelV1StreamPart } from "ai";
import { StreamableValue } from "ai/rsc";
import { ReactNode } from "react";

export interface ExtendedCoreMessage extends Omit<CoreMessage, "id"> {
  id: string;
}

export type MessageProperty = {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: CoreMessage["content"];
};

export type ChatProperties = {
  chatId: string;
  title: string;
  created: Date;
  userId: string;
  messages: MessageProperty[];
  sharePath?: string;
};

/**
 * Construct a set of types that match by given controller
 * @example For mutating client state generation from server action
 */
export type FunctionController = (args?: any) => void | Promise<void>;

export type AssignController = Record<string, FunctionController>;

export type PayloadData = {
  textInput?: string;
  attachData?: string;
  inquiryResponse?: InquiryResponse;
};

export type UseAction = {
  sendMessage: (
    payload: PayloadData,
    assignController?: AssignController
  ) => Promise<SendMessageCallback>;
};

export type SendMessageCallback = {
  id: string;
  display: ReactNode;
  stream: ReadableStream<LanguageModelV1StreamPart>;
  generation: StreamableValue<StreamGeneration>;
};

export type AIState = {
  chatId: string;
  messages: MessageProperty[];
  isSharedPage?: boolean;
};

export type UIState = {
  id: string;
  display: ReactNode;
}[];

export type StreamGeneration = {
  loading: boolean;
  process: "initial" | "generating" | "error" | "done";
  error?: string;
};

export const AvailableTools = {
  SEARCH_PRODUCT: "searchProduct",
  GET_PRODUCT_DETAILS: "getProductDetails",
  INQUIRE_USER: "inquireUser",
} as const;

export type AvailableTool =
  (typeof AvailableTools)[keyof typeof AvailableTools];

export type MutationPayload = {
  name: AvailableTool;
  args: unknown;
  result: unknown;
  overrideAssistant?: {
    content: string;
  };
};

/**
 * Construct type from defined tool args and tool result data
 * @type `A = unknown` is for args
 * @type `T = unknown` is for data or tool result
 */
export type ExtendedToolResult<A = unknown, D = unknown> = {
  success: boolean;
  name: string;
  args: A;
  data: D;
};

export type AttachLink = {
  meta: {
    id: number | string;
    title: string;
    link: string;
  };
};

export type ParsedUserMessage = {
  text_input: string;
  attach_link?: string;
};

export type UserMessageProp = {
  text_input?: string;
  attach_link?: string;
  inquiry_response?: InquiryResponse;
};

export type InquiryResponse = {
  question: string;
  selected: string[];
  input: string | null;
};
