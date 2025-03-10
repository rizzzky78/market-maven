import winston, { Logger as WinstonLogger, format, transports } from "winston";

type LogLevel = "error" | "warn" | "info" | "debug";

/**
 * Enhanced Logger class to handle comprehensive logging using winston.
 */
class Logger {
  private logger: WinstonLogger;

  constructor() {
    const { combine, timestamp, printf } = format;

    // Simple format without colorization
    const customFormat = printf(({ level, message, timestamp }) => {
      const formattedTimestamp = `[${timestamp}]`;
      const formattedLevel = `[${level.toUpperCase()}]`;

      return `${formattedTimestamp} ${formattedLevel} ${message}`;
    });

    // Configure winston logger with only console transport
    this.logger = winston.createLogger({
      level: (process.env.LOG_LEVEL as LogLevel) || "info",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }), // Added milliseconds
        customFormat
      ),
      transports: [
        // Console transport without color support
        new transports.Console({
          format: customFormat,
        }),
      ],
    });
  }

  /**
   * Logs an error message.
   * @param message - The message to log.
   * @param metadata - Optional additional context or metadata.
   */
  error(message: string, metadata?: any): void {
    this.logger.error(this.construct(message, [metadata]));
  }

  /**
   * Logs a warning message.
   * @param message - The message to log.
   * @param metadata - Optional additional context or metadata.
   */
  warn(message: string, metadata?: any): void {
    this.logger.warn(this.construct(message, [metadata]));
  }

  /**
   * Logs an informational message.
   * @param message - The message to log.
   * @param metadata - Optional additional context or metadata.
   */
  info(message: string, metadata?: any): void {
    this.logger.info(this.construct(message, [metadata]));
  }

  /**
   * Logs a debug message (only in development mode).
   * @param message - The message to log.
   * @param metadata - Optional additional context or metadata.
   */
  debug(message: string, metadata?: any): void {
    if (process.env.NODE_ENV === "development") {
      this.logger.debug(message, metadata);
    }
  }

  /**
   * Logs a custom level message.
   * @param level - The log level.
   * @param message - The message to log.
   * @param metadata - Optional additional context or metadata.
   */
  log(level: LogLevel, message: string, metadata?: any): void {
    this.logger.log({ level, message, ...metadata });
  }

  /**
   * Create a child logger with additional context.
   * @param meta - Metadata to be added to child logger.
   * @returns A new logger instance with additional context.
   */
  child(meta: Record<string, any>): WinstonLogger {
    return this.logger.child(meta);
  }

  private construct(ctx: string, meta: unknown[]) {
    return JSON.stringify({ ctx, meta }, null, 2);
  }
}

// Export a singleton instance of the logger
const logger = new Logger();

export default logger;
