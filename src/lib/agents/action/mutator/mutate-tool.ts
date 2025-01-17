import { generateId } from "ai";
import {
  ExtendedToolResult,
  MessageProperty,
  MutationPayload,
} from "@/lib/types/ai";
import { ToolMutationError } from "../thrower/tool-mutation-error";

/**
 * Type for tool mutation configuration
 */
type ToolMutationConfig = {
  validateArgs?: (args: unknown) => boolean;
  validateResult?: (result: unknown) => boolean;
  transformResult?: (result: unknown) => unknown;
};

/**
 * Type for mutation result
 */
type MutationResult = {
  mutate: MessageProperty[];
  toolResult: ExtendedToolResult;
};

/**
 * Creates a validated tool mutation with proper typing and error handling
 * @param payload - The mutation payload containing tool name, arguments, and result
 * @param config - Optional configuration for validation and transformation
 * @returns Object containing mutation messages and tool result
 * @throws ToolMutationError if validation fails or required data is missing
 */
export function mutateTool<A = unknown, D = unknown>(
  payload: MutationPayload,
  config?: ToolMutationConfig
): MutationResult {
  const { name, args, result, overrideAssistant } = payload;

  // Validate required fields
  if (!name) {
    throw new ToolMutationError(
      "Tool name is required",
      "unknown",
      "MISSING_TOOL_NAME"
    );
  }

  try {
    // Validate arguments if configured
    if (config?.validateArgs && !config.validateArgs(args)) {
      throw new ToolMutationError(
        "Invalid tool arguments",
        name,
        "INVALID_ARGS"
      );
    }

    // Validate result if configured
    if (config?.validateResult && !config.validateResult(result)) {
      throw new ToolMutationError(
        "Invalid tool result",
        name,
        "INVALID_RESULT"
      );
    }

    const toolCallId = generateId();
    const transformedResult = config?.transformResult?.(result) ?? result;

    // Construct the tool result with proper typing
    const constructToolResult: ExtendedToolResult<A, D> = {
      success: Boolean(transformedResult),
      name,
      args: args as A,
      data: transformedResult as D,
    };

    // Build the mutation messages array
    const mutationMessages: MessageProperty[] = [
      // Tool call message
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
      // Tool result message
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

    // Add override assistant message if provided
    if (overrideAssistant?.content) {
      mutationMessages.push({
        id: generateId(),
        role: "assistant",
        content: overrideAssistant.content,
      });
    }

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
 * Type guard to check if a value is a valid tool result
 */
export function isToolResult<A, D>(
  value: unknown
): value is ExtendedToolResult<A, D> {
  if (!value || typeof value !== "object") return false;

  const result = value as ExtendedToolResult;
  return (
    typeof result.success === "boolean" &&
    typeof result.name === "string" &&
    "args" in result &&
    "data" in result
  );
}
