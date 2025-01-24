import { CoreMessage, LanguageModelV1StreamPart } from "ai";
import { StreamableValue } from "ai/rsc";
import { ReactNode } from "react";

/**
 * Extended version of CoreMessage that ensures the 'id' is always a string,
 * allowing more flexible message identification across different systems.
 */
export interface ExtendedCoreMessage extends Omit<CoreMessage, "id"> {
  /** Unique string identifier for the message */
  id: string;
}

/**
 * Represents the core properties of a message in a chat system,
 * defining the essential attributes for tracking and displaying messages.
 */
export type MessageProperty = {
  /** Unique identifier for the message */
  id: string;
  /** Defines the source or type of the message */
  role: "user" | "assistant" | "system" | "tool";
  /** Content of the message, inheriting from CoreMessage */
  content: CoreMessage["content"];
};

/**
 * Comprehensive type defining the complete structure of a chat instance,
 * including metadata and message history for tracking conversations.
 */
export type ChatProperties = {
  /** Unique identifier for the entire chat session */
  chatId: string;
  /** Human-readable title or description of the chat */
  title: string;
  /** Timestamp of chat creation */
  created: Date;
  /** Identifier of the user who initiated the chat */
  userId: string;
  /** Array of messages in the conversation */
  messages: MessageProperty[];
  /** Optional path for sharing the chat */
  sharePath?: string;
};

/**
 * Type representing a generic controller function that can be used for
 * state mutations or side effects, with optional arguments.
 */
export type FunctionController = (args?: any) => void | Promise<void>;

/**
 * A record of named controller functions that can be dynamically assigned
 * and executed.
 */
export type AssignController = Record<string, FunctionController>;

/**
 * Flexible payload structure for sending message-related data,
 * supporting text input, attachments, and inquiry responses.
 */
export type PayloadData = {
  /** Optional text input from user */
  textInput?: string;
  /** Optional attached product data */
  attachProduct?: string;
  /** Optional response to a specific inquiry */
  inquiryResponse?: InquiryResponse;
};

/**
 * Interface defining the contract for message sending actions,
 * providing a method to send messages with optional controller assignments.
 */
export type UseAction = {
  /**
   * Sends a message with optional payload and controller assignments
   * @param payload Data associated with the message
   * @param assignController Optional controllers to be executed
   * @returns A promise resolving to the message callback
   */
  sendMessage: (
    payload: PayloadData,
    assignController?: AssignController
  ) => Promise<SendMessageCallback>;
};

/**
 * Comprehensive callback type for tracking the full lifecycle and
 * representation of a sent message, including streaming and display capabilities.
 */
export type SendMessageCallback = {
  /** Unique identifier for the message */
  id: string;
  /** Renderable UI representation of the message */
  display: ReactNode;
  /** Streamable message content */
  stream: ReadableStream<LanguageModelV1StreamPart>;
  /** Generation status and metadata */
  generation: StreamableValue<StreamGeneration>;
};

/**
 * Represents the AI's internal state, tracking chat context and message history.
 */
export type AIState = {
  /** Current chat session identifier */
  chatId: string;
  /** Accumulated messages in the conversation */
  messages: MessageProperty[];
  /** Optional flag indicating if the page is shared */
  isSharedPage?: boolean;
};

/**
 * Defines the UI state as an array of displayable message representations.
 */
export type UIState = {
  /** Unique identifier for the UI element */
  id: string;
  /** Renderable UI component */
  display: ReactNode;
}[];

/**
 * Tracks the generation process of a stream, providing status and error handling.
 */
export type StreamGeneration = {
  /** Indicates if generation is in progress */
  loading: boolean;
  /** Current generation stage */
  process: "initial" | "generating" | "error" | "done";
  /** Optional error message if generation fails */
  error?: string;
};

/**
 * Utility type for supporting either direct values or value-generating functions.
 */
export type ValueOrUpdater<T> = T | ((current: T) => T);

/**
 * Provides a type-safe interface for managing mutable AI state with
 * getter, updater, and completion methods.
 */
export type MutableAIState<T = AIState> = {
  /** Retrieves current state */
  get: () => T;
  /** Updates state directly or via function */
  update: (newState: ValueOrUpdater<T>) => void;
  /** Completes state management */
  done: (() => void) | ((newState: T) => void);
};

/**
 * Constant object defining available tool names for type-safe tool selection.
 */
export const AvailableTools = {
  /** Tool for searching products */
  SEARCH_PRODUCT: "searchProduct",
  /** Tool for retrieving product details */
  GET_PRODUCT_DETAILS: "getProductDetails",
  /** Tool for user inquiry */
  INQUIRE_USER: "inquireUser",
} as const;

/**
 * Type derived from AvailableTools for strict type checking of tool names.
 */
export type AvailableTool =
  (typeof AvailableTools)[keyof typeof AvailableTools];

/**
 * Represents a mutation payload for tools, supporting flexible
 * tool execution and result handling.
 */
export type MutationPayload = {
  /** Name of the tool being used */
  name: AvailableTool;
  /** Arguments passed to the tool */
  args: unknown;
  /** Result of the tool execution */
  result: unknown;
  /** Optional override for assistant response */
  overrideAssistant?: {
    /** Content to override the assistant's response */
    content: string;
  };
};

/**
 * Generic type for representing tool execution results with
 * type-safe arguments and data handling.
 */
export type ExtendedToolResult<A = unknown, D = unknown> = {
  /** Indicates if the tool execution was successful */
  success: boolean;
  /** Name of the executed tool */
  name: string;
  /** Arguments used in tool execution */
  args: A;
  /** Resulting data from tool execution */
  data: D;
};

/**
 * Defines the base structure for a product with essential identifying information.
 */
export type BaseProduct = {
  /** Unique product identifier */
  id: string;
  /** Product name or description */
  title: string;
  /** URL or reference link for the product */
  link: string;
};

/**
 * Type representing a product link with its associated metadata.
 */
export type AttachLink = {
  /** Metadata for the attached link */
  meta: BaseProduct;
};

/**
 * Type for attaching a complete product object to a message or context.
 */
export type AttachProduct = {
  /** The product being attached */
  product: BaseProduct;
};

/**
 * Represents a collection of products for comparison purposes.
 */
export type ProductComparison = {
  /** Array of products to compare */
  compare: BaseProduct[];
};

/**
 * Describes the possible content types for a user message,
 * supporting text input, product attachments, and inquiry responses.
 */
export type UserContentMessage = {
  /** Optional text input from user */
  text_input?: string;
  /** Optional product attachment */
  attach_product?: AttachProduct;
  /** Optional response to an inquiry */
  inquiry_response?: InquiryResponse;
};

/**
 * Represents a parsed user message with normalized input and optional link.
 */
export type ParsedUserMessage = {
  /** Extracted or processed text input */
  text_input: string;
  /** Optional attached link */
  attach_link?: string;
};

/**
 * Flexible type for user message properties, supporting various input types.
 */
export type UserMessageProp = {
  /** Optional text input */
  text_input?: string;
  /** Optional attached link */
  attach_link?: string;
  /** Optional inquiry response */
  inquiry_response?: InquiryResponse;
};

/**
 * Represents the structure of a user inquiry response,
 * capturing the question, selected options, and additional input.
 */
export type InquiryResponse = {
  /** The original inquiry or prompt */
  question: string;
  /** Array of selected response options */
  selected: string[];
  /** Optional additional user input */
  input: string | null;
};
