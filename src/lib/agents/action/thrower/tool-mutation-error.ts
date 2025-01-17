/**
 * Error class for tool mutation-related errors
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
