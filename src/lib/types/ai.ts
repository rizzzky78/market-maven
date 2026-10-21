import type { UIMessage } from "ai";
import type { Models } from "@/lib/agents/models";
import type { ModelConfig } from "@/lib/agents/providers";
import { ReactNode } from "react";
import { z } from "zod";

/**
 * Persisted message content parts. These keep the AI SDK 4 part shape
 * (`args` / `result`) on purpose: chat histories already stored in Redis use
 * it, and `ui-mapper` restores the UI from it. Model-facing messages are
 * derived from it by `toModelMessages`.
 */
export type TextContentPart = { type: "text"; text: string };

export type ToolCallContentPart = {
  type: "tool-call";
  toolCallId: string;
  toolName: string;
  args: unknown;
};

export type ToolResultContentPart = {
  type: "tool-result";
  toolCallId: string;
  toolName: string;
  result: unknown;
};

export type MessageContent =
  | string
  | Array<TextContentPart | ToolCallContentPart | ToolResultContentPart>;

/**
 * Represents the core properties of a message in a chat system,
 * defining the essential attributes for tracking and displaying messages.
 */
export type MessageProperty = {
  /** Unique identifier for the message */
  id: string;
  /** Defines the source or type of the message */
  role: "user" | "assistant" | "system" | "tool";
  /** Content of the message in the persisted part shape */
  content: MessageContent;
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

export type RefferenceDataSource = "insight" | "tokopedia" | "shopee";

/**
 * Type represent optional arguments non-payload value passed to server-action
 */
export type ExtendedRequestOption = {
  /** On request argument properties */
  onRequest?: {
    /** Enable response enhancement through external data via APIs */
    search?: boolean;
    /** Enable related query injection based on latest chat conversation data */
    related?: boolean;
    /** Enable models to refers data source from user prefered source */
    reffSource?: RefferenceDataSource;
  };
};

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
 * Configuration options for tool mutation validation and transformation
 */
export type ToolMutationConfig = {
  /** Optional function to validate tool arguments */
  validateArgs?: (args: unknown) => boolean;
  /** Optional function to validate tool results */
  validateResult?: (result: unknown) => boolean;
  /** Optional function to transform the result before storing */
  transformResult?: (result: unknown) => unknown;
};

/**
 * Structure representing the result of a tool mutation operation
 */
export type MutationResult<ARGS, DATA> = {
  /** Array of messages generated during mutation */
  mutate: MessageProperty[];
  /** Result of the tool execution */
  toolResult: ExtendedToolResult<ARGS, DATA>;
};

/**
 * Serializable description of one rendered component: the name of a
 * component in the client view registry and its props. Tools yield these
 * instead of React elements; the client renders them (see `view-renderer`).
 */
export type ViewNode = { component: string; props: Record<string, unknown> };

/** What a render tool shows: nodes in order (arrays nest like fragments). */
export type View = ViewNode | null | undefined | false | readonly View[];

/**
 * Represents a type that can either be a View or a Promise resolving to one.
 */
export type Streamable = View | Promise<View>;

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
 * @template INPUT_SCHEMA - A Zod type used to validate and infer the shape of the tool input.
 */
export type RenderTool<INPUT_SCHEMA extends z.ZodType = any> = {
  /**
   * An optional description providing additional information about the tool.
   */
  description?: string;

  /**
   * The input schema for the render tool, defined as a Zod schema.
   */
  inputSchema: INPUT_SCHEMA;

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
      z.infer<INPUT_SCHEMA>,
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
 * Represents the primary category or source of a generation process.
 */
export type HeadStatus =
  /** External API call or integration */
  | "api"
  /** Database operation or query */
  | "database"
  /** Real-time data streaming */
  | "stream"
  /** Tool execution or utility function */
  | "tool";

/**
 * Represents the current state or phase of a generation process.
 * Organized from initial state through completion or failure states.
 */
export type SubStatus =
  /** Process has been initialized but not started */
  | "initial"
  /** Data is being requested from external source */
  | "requesting-data"
  /** Content or result is being generated */
  | "generating"
  /** Process completed successfully */
  | "success"
  /** Process completed normally (alternative to success) */
  | "done"
  /** Saving current state data */
  | "save-state"
  /** Data not found */
  | "not-found"
  /** Recoverable error occurred */
  | "error"
  /** Process partialy executed */
  | "partial-done"
  /** Proceed to next step action */
  | "next-action"
  /** Unrecoverable error that stops the entire process */
  | "fatal-error";

/**
 * Composite status type combining head status and sub status.
 * Provides a complete picture of what component is in what state.
 *
 * Common patterns:
 * - `"api:requesting-data"` - Fetching data from external API
 * - `"database:error"` - Database operation failed
 * - `"tool:success"` - Tool execution completed successfully
 * - `"stream:fatal-error"` - Streaming process encountered unrecoverable error
 */
export type GenerationStatus = `${HeadStatus}:${SubStatus}`;

/**
 * Utility type to extract the HeadStatus from a GenerationStatus
 *
 * @example
 * ```typescript
 * type ApiHead = ExtractHeadStatus<"api:generating">; // "api"
 * ```
 */
export type ExtractHeadStatus<T extends GenerationStatus> =
  T extends `${infer Head}:${string}` ? Head : never;

/**
 * Utility type to extract the SubStatus from a GenerationStatus
 *
 * @example
 * ```typescript
 * type GeneratingStatus = ExtractSubStatus<"api:generating">; // "generating"
 * ```
 */
export type ExtractSubStatus<T extends GenerationStatus> =
  T extends `${string}:${infer Sub}` ? Sub : never;

/**
 * Utility type to get all possible GenerationStatus values for a specific HeadStatus
 *
 * @example
 * ```typescript
 * type ApiStatuses = StatusesForHead<"api">;
 * // "api:initial" | "api:requesting-data" | "api:generating" | etc.
 * ```
 */
export type StatusesForHead<T extends HeadStatus> = `${T}:${SubStatus}`;

/**
 * Utility type to get all possible GenerationStatus values for a specific SubStatus
 *
 * @example
 * ```typescript
 * type ErrorStatuses = StatusesForSub<"error">;
 * // "api:error" | "database:error" | "stream:error" | "tool:error"
 * ```
 */
export type StatusesForSub<T extends SubStatus> = `${HeadStatus}:${T}`;

/**
 * Tracks the generation process of a stream, providing status and error handling.
 */
export type StreamGeneration = {
  /** Indicates if generation is in progress */
  loading: boolean;
  /** Current generation stage */
  process: GenerationStatus;
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
  done: (newState?: T) => void;
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
  /** Tool to do research products based on user intent and scopes */
  RECOMMENDATOR: "recommendator",
  /** Tool to answer factual questions with web-grounded evidence */
  WEB_RESEARCH: "webResearch",
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
export type MutationPayload<ARGS, DATA> = {
  /** Name of the tool being used */
  name: AvailableTool;
  /** Arguments passed to the tool */
  args: ARGS;
  /** Result of the tool execution */
  result: DATA;
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
 * A value streamed to the client in a `data-stream` part. Components receive
 * it as a prop and re-render as `value` grows.
 */
export type Streamed<T> = {
  value?: T;
  status: "streaming" | "done" | "error";
};

/**
 * Server handle of a streamed value: `value` is the prop to pass to a view,
 * `update` / `done` / `error` push new states to the client.
 */
export type StreamableValue<T> = {
  value: Streamed<T>;
  update: (value: T) => void;
  done: (value?: T) => void;
  error: (error: unknown) => void;
};

/** The writable side of a `StreamableValue`. */
export type StreamableSink<T> = Omit<StreamableValue<T>, "value">;

/** Lifecycle of one tool call as shown in the chat. */
export type ToolCallStatus = "running" | "done" | "error" | "stopped";

/**
 * A tool call reported to the client in a `data-tool` part (replaced in
 * place as its status changes).
 */
export type ToolCallInfo = {
  /** Tool name, one of `AvailableTools` */
  name: string;
  /** The input the orchestrator called the tool with */
  input: unknown;
  status: ToolCallStatus;
  /** Wall time of the call, set once it has finished */
  durationMs?: number;
};

/**
 * The chat message shape exchanged with `useChat`. User messages carry the
 * submitted content in a `data-user` part; assistant messages carry the
 * rendered `data-view` (replaced in place as it changes), the `data-stream`
 * values its nodes reference and the `data-tool` call it came from.
 * `data-generation` is transient progress for the chat panel.
 */
export type MavenUIMessage = UIMessage<
  never,
  {
    user: UserContentMessage;
    view: ViewNode[];
    stream: Streamed<unknown>;
    tool: ToolCallInfo;
    generation: StreamGeneration;
  }
>;

/**
 * Request body of `POST /api/chat`.
 */
export type ChatRequestBody = {
  chatId: string;
  payload: PayloadData;
  requestOption?: ExtendedRequestOption;
  /** The user's own LLM provider settings; the app's defaults when absent */
  model?: ModelConfig;
};

export type ToolsetProps = {
  generation: StreamableSink<StreamGeneration>;
  /** Creates values streamed to the client for the current reply. */
  createStreamable: <T>(initial?: T) => StreamableValue<T>;
  /** Aborted when the client stops the reply; pass it to model calls. */
  abortSignal?: AbortSignal;
  /** The models of this request (the user's own provider or the defaults). */
  models: Models;
  state: MutableAIState<AIState>;
  requestOption?: ExtendedRequestOption;
  userMessage?: UserContentMessage;
};

/**
 * Defines the base structure for a product with essential identifying information.
 */
export type BaseProduct = {
  purpose: "get-product-details";
  /** Product name or description */
  title: string;
  /** URL or reference link for the product */
  link?: string;
  /** Call ID reference from tool call */
  callId: string;
  /** Reference source for each search product object generated */
  source: "global" | "tokopedia";
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
 * Max only two products
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
 * Represents an attached value form user inetractions such a button,
 * this will push new product data to array
 */
export type AttachCompare = {
  for: {
    title: string;
    callId: string;
  };
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

/**
 * Response type for the rate limit checking operation
 */
export type RateLimitResponse = {
  /** Whether the user is eligible to make another request */
  eligible: boolean;
  /** The reason why the user is not eligible, if applicable */
  reason?: "CONVERSATION_LIMIT_EXCEEDED" | "RPD_LIMIT_EXCEEDED";
  /** System-wide limits configuration */
  limits: {
    /** Maximum requests allowed per day */
    requestsPerDay: number;
    /** Maximum allowed messages in a conversation */
    conversationLength: number;
  };
  /** Current state of the user's usage */
  current: {
    /** Number of requests made today */
    requests: number;
    /** Current length of the conversation */
    conversationLength: number;
    /** Whether this is the user's first time using the service */
    isFirstTimeUser: boolean;
  };
  /** Remaining quota information */
  remaining: {
    /** Number of requests remaining today */
    requests: number;
    /** Number of messages that can still be added to this conversation */
    messages: number;
  };
  /** Information about when the rate limit will reset */
  reset?: {
    /** Unix timestamp when the rate limit resets */
    timestamp: number;
    /** Human-readable format of time until reset */
    formatted: string;
  };
};
