import { generateId } from "ai";
import {
  AIState,
  ExtendedToolResult,
  MessageProperty,
  MutableAIState,
  MutationPayload,
  MutationResult,
  ToolMutationConfig,
} from "@/lib/types/ai";

/**
 * Custom error class for handling tool mutation-related errors with specific error codes
 * and tool identification.
 *
 * @example
 * throw new ToolMutationError("Invalid arguments provided", "searchTool", "INVALID_ARGS");
 */
export class ToolMutationError extends Error {
  constructor(
    message: string,
    public readonly toolName: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "ToolMutationError";
    Object.setPrototypeOf(this, ToolMutationError.prototype);
  }
}

/**
 * Creates a validated tool mutation with proper typing and error handling. This function
 * processes tool executions, validates inputs/outputs, and manages the message flow.
 *
 * @template ARGS - Type of the tool arguments
 * @template DATA - Type of the tool result data
 *
 * @param {MutableAIState<AIState>} state - Mutable state object for managing AI context
 * @param {MutationPayload} payload - Mutation payload containing tool execution details
 * @param {ToolMutationConfig} [config] - Optional configuration for validation and transformation
 *
 * @returns {MutationResult} Object containing mutation messages and tool result
 *
 * @throws {ToolMutationError} When:
 * - Tool name is missing (code: MISSING_TOOL_NAME)
 * - Arguments validation fails (code: INVALID_ARGS)
 * - Result validation fails (code: INVALID_RESULT)
 * - Unexpected errors occur (code: UNEXPECTED_ERROR)
 *
 * @example
 * ```typescript
 * const result = mutateTool(
 *   state,
 *   {
 *     name: "searchTool",
 *     args: { query: "example" },
 *     result: { found: true, items: [] }
 *   },
 *   {
 *     validateArgs: (args) => args.query && typeof args.query === "string",
 *     validateResult: (result) => result.found !== undefined
 *   }
 * );
 * ```
 */
export function mutateTool<ARGS = unknown, DATA = unknown>(
  state: MutableAIState<AIState>,
  payload: MutationPayload<ARGS, DATA>,
  config?: ToolMutationConfig
): MutationResult<ARGS, DATA> {
  const { name, args, result, overrideAssistant } = payload;

  if (!name) {
    throw new ToolMutationError(
      "Tool name is required",
      "unknown",
      "MISSING_TOOL_NAME"
    );
  }

  try {
    if (config?.validateArgs && !config.validateArgs(args)) {
      throw new ToolMutationError(
        "Invalid tool arguments",
        name,
        "INVALID_ARGS"
      );
    }

    if (config?.validateResult && !config.validateResult(result)) {
      throw new ToolMutationError(
        "Invalid tool result",
        name,
        "INVALID_RESULT"
      );
    }

    const toolCallId = generateId();
    const transformedResult = config?.transformResult?.(result) ?? result;

    const constructToolResult: ExtendedToolResult<ARGS, DATA> = {
      success: Boolean(transformedResult),
      name,
      args: args as ARGS,
      data: transformedResult as DATA,
    };

    const mutationMessages: MessageProperty[] = [
      {
        id: generateId(),
        role: "assistant",
        content: [
          {
            type: "tool-call",
            toolCallId,
            toolName: name,
            args,
          },
        ],
      },
      {
        id: generateId(),
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId,
            toolName: name,
            result: JSON.stringify(constructToolResult),
          },
        ],
      },
    ];

    if (overrideAssistant?.content) {
      mutationMessages.push({
        id: generateId(),
        role: "assistant",
        content: overrideAssistant.content,
      });
    }

    state.done({
      ...state.get(),
      messages: [...state.get().messages, ...mutationMessages],
    });

    return {
      mutate: mutationMessages,
      toolResult: constructToolResult,
    };
  } catch (error) {
    if (error instanceof ToolMutationError) {
      throw error;
    }

    throw new ToolMutationError(
      `Unexpected error during tool mutation: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      name,
      "UNEXPECTED_ERROR"
    );
  }
}

/**
 * Type guard to verify if a value matches the ExtendedToolResult interface structure.
 *
 * @template ARGS - Type of the tool arguments
 * @template DATA - Type of the tool result data
 * @param {unknown} value - Value to check
 * @returns {boolean} True if value matches ExtendedToolResult structure
 *
 * @example
 * ```typescript
 * const result = someOperation();
 * if (isToolResult<SearchArgs, SearchData>(result)) {
 *   // TypeScript now knows result is ExtendedToolResult<SearchArgs, SearchData>
 *   console.log(result.data);
 * }
 * ```
 */
export function isToolResult<ARGS, DATA>(
  value: unknown
): value is ExtendedToolResult<ARGS, DATA> {
  if (!value || typeof value !== "object") return false;

  const result = value as ExtendedToolResult;
  return (
    typeof result.success === "boolean" &&
    typeof result.name === "string" &&
    "args" in result &&
    "data" in result
  );
}

export function transformTool<ARGS, DATA>(
  payload: MutationPayload<ARGS, DATA>
) {
  const { name, args, result } = payload;

  const toolCallId = generateId();
  const constructToolResult: ExtendedToolResult<ARGS, DATA> = {
    success: Boolean(result),
    name,
    args: args as ARGS,
    data: result as DATA,
  };
  const mutation: MessageProperty[] = [
    {
      id: generateId(),
      role: "assistant",
      content: [
        {
          type: "tool-call",
          toolCallId,
          toolName: name,
          args,
        },
      ],
    },
    {
      id: generateId(),
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId,
          toolName: name,
          result: JSON.stringify(constructToolResult),
        },
      ],
    },
  ];

  return {
    transformResult: mutation,
  };
}
