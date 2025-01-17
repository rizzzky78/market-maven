/**
 * Custom error class for environment variable-related errors
 */
export class EnvironmentVariableError extends Error {
  constructor(message: string, public readonly variableName: string) {
    super(message);
    this.name = "EnvironmentVariableError";
    Object.setPrototypeOf(this, EnvironmentVariableError.prototype);
  }
}

/**
 * Type definition for environment variable validation options
 */
interface EnvValidationOptions {
  required?: boolean;
  pattern?: RegExp;
  validator?: (value: string) => boolean;
}

/**
 * Cache to store environment variables and reduce repeated lookups
 */
const envCache = new Map<string, string>();

/**
 * Retrieves and validates an environment variable
 * @param key - The name of the environment variable to retrieve
 * @param options - Validation options for the environment variable
 * @returns The value of the environment variable
 * @throws EnvironmentVariableError if validation fails or variable is not found
 */
export function getEnv(
  key: string,
  options: EnvValidationOptions = { required: true }
): string {
  // Check cache first
  if (envCache.has(key)) {
    return envCache.get(key)!;
  }

  try {
    // Retrieve environment variable
    const value = process.env[key]?.trim();

    // Handle required check
    if (options.required && !value) {
      throw new EnvironmentVariableError(
        `Environment variable "${key}" is not set`,
        key
      );
    }

    // Return early if value is not required and not set
    if (!options.required && !value) {
      return "";
    }

    // Validate against pattern if specified
    if (options.pattern && !options.pattern.test(value!)) {
      throw new EnvironmentVariableError(
        `Environment variable "${key}" does not match required pattern: ${options.pattern}`,
        key
      );
    }

    // Run custom validator if specified
    if (options.validator && !options.validator(value!)) {
      throw new EnvironmentVariableError(
        `Environment variable "${key}" failed custom validation`,
        key
      );
    }

    // Cache the valid value
    envCache.set(key, value!);
    return value!;
  } catch (error) {
    // Convert unknown errors to EnvironmentVariableError
    if (!(error instanceof EnvironmentVariableError)) {
      throw new EnvironmentVariableError(
        `Error retrieving environment variable "${key}": ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        key
      );
    }
    throw error;
  }
}

/**
 * Clears the environment variable cache
 * Useful for testing or when environment variables might change
 */
export function clearEnvCache(): void {
  envCache.clear();
}

/**
 * Type-safe wrapper for boolean environment variables
 */
export function getBooleanEnv(key: string, defaultValue = false): boolean {
  const value = getEnv(key, { required: false });
  if (!value) return defaultValue;
  return ["true", "1", "yes"].includes(value.toLowerCase());
}

/**
 * Type-safe wrapper for numeric environment variables
 */
export function getNumericEnv(key: string): number {
  const value = getEnv(key);
  const num = Number(value);
  if (isNaN(num)) {
    throw new EnvironmentVariableError(
      `Environment variable "${key}" must be a valid number`,
      key
    );
  }
  return num;
}
