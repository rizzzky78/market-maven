import { CoreMessage, LanguageModelV1StreamPart } from "ai";
import { StreamableValue } from "ai/rsc";
import { ReactNode } from "react";
import { z } from "zod";

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
  attachProduct?: AttachProduct;
  /** Optional products comparison data */
  productCompare?: ProductCompare;
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
  orchestrator?: (
    payload: PayloadData,
    assignController?: AssignController
  ) => Promise<OrchestratorCallback>;
  extractor?: (product: AttachProduct) => Promise<ExtractorCallback>;
  testing?: (message: string) => Promise<TestingMessageCallback>;
};

export type TestingMessageCallback = {
  id: string;
  display: ReactNode;
};

export type BaseActionCallback = {
  /** Unique identifier for the message */
  id: string;
  /** Renderable UI representation of the message */
  display: ReactNode;
  /** Streamable message content */
  stream?: ReadableStream<LanguageModelV1StreamPart>;
  /** Generation status and metadata */
  generation?: StreamableValue<StreamGeneration>;
};

/**
 * Comprehensive callback type for tracking the full lifecycle and
 * representation of a sent message, including streaming and display capabilities.
 */
export type OrchestratorCallback = {
  source: "orchestrator";
} & BaseActionCallback;

export type ExtractorCallback = {
  source: "extractor";
} & BaseActionCallback;

/**
 * Represents the AI's internal state, tracking chat context and message history.
 */
export type AIState = {
  /** Current chat session identifier */
  chatId: string;
  /** A username of user, this typically are in form of email instead an ID */
  username: string;
  /** Accumulated messages in the conversation */
  messages: MessageProperty[];
  /** Optional flag indicating if the page is shared */
  isSharedPage?: boolean;
};

/**
 * Represents a type that can either be a ReactNode or a Promise resolving to a ReactNode.
 */
export type Streamable = ReactNode | Promise<ReactNode>;

/**
 * A type for a renderer function, which takes an array of arguments and produces streamable content.
 * The renderer can return one of the following:
 * - `Streamable` directly
 * - A synchronous generator that yields `Streamable` values and returns a final `Streamable`
 * - An asynchronous generator that yields `Streamable` values and returns a final `Streamable`
 *
 * @template T - An array type representing the argument structure of the renderer.
 */
export type Renderer<T extends Array<any>> = (
  ...args: T
) =>
  | Streamable
  | Generator<Streamable, Streamable, void>
  | AsyncGenerator<Streamable, Streamable, void>;

/**
 * Represents a render tool, defining its properties and optional rendering logic.
 *
 * @template PARAMETERS - A Zod type used to validate and infer the shape of parameters.
 */
export type RenderTool<PARAMETERS extends z.ZodTypeAny = any> = {
  /**
   * An optional description providing additional information about the tool.
   */
  description?: string;

  /**
   * The parameters for the render tool, defined as a Zod schema.
   */
  parameters: PARAMETERS;

  /**
   * An optional renderer function that generates streamable content based on:
   * - The inferred parameters of the Zod schema.
   * - Metadata about the tool, including its name and a unique call ID.
   *
   * The renderer can return:
   * - A `Streamable` directly
   * - A synchronous generator that yields `Streamable` values and returns a final `Streamable`
   * - An asynchronous generator that yields `Streamable` values and returns a final `Streamable`
   */
  generate?: Renderer<
    [
      z.infer<PARAMETERS>,
      {
        /**
         * The name of the tool, provided as metadata to the renderer.
         */
        toolName: string;

        /**
         * A unique identifier for the tool call, useful for tracking or debugging.
         */
        toolCallId: string;
      }
    ]
  >;
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
  process:
    | "initial"
    | "generating"
    | "api_error"
    | "fatal_error"
    | "done"
    | ({} & string);
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
  /** Tool for comparing two products */
  PRODUCTS_COMPARISON: "productsComparison",
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
 * Type representing a one-to-one product comparison based on user selection.
 */
export type ProductCompare = {
  /** A one-to-one product array object data, only contain two array object */
  for: {
    /** A title of product to be compared */
    title: string;
    /** A callId identifier match by get-product-details tool result */
    callId: string;
  }[];
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
  text_input?: string | null;
  /** Optional product attachment */
  attach_product?: AttachProduct | null;
  /** Optional prodct compare requested by user */
  product_compare?: ProductCompare | null;
  /** Optional response to an inquiry */
  inquiry_response?: InquiryResponse | null;
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
  question?: string;
  /** Array of selected response options */
  selected?: string[];
  /** Optional additional user input */
  input?: string | null;
  /** Is inquiry skipped by user */
  skipped?: boolean;
};
