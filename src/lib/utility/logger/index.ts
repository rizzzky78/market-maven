import winston, { Logger as WinstonLogger, format, transports } from "winston";
import chalk from "chalk";

type LogLevel = "error" | "warn" | "info" | "debug";

// Color configuration for different log levels
const LOG_COLORS = {
  error: chalk.bold.red,
  warn: chalk.bold.yellow,
  info: chalk.bold.blue,
  debug: chalk.bold.green,
};

// Background color configuration (optional)
const LOG_BG_COLORS = {
  error: chalk.bgRed.white,
  warn: chalk.bgYellow.black,
  info: chalk.bgBlue.white,
  debug: chalk.bgGreen.black,
};

/**
 * Enhanced Logger class to handle comprehensive logging using winston and chalk.
 */
class Logger {
  private logger: WinstonLogger;

  constructor() {
    const { combine, timestamp, printf, colorize } = format;

    // Enhanced custom format for logs with more detailed styling
    const customFormat = printf(({ level, message, timestamp }) => {
      const colorFunction = LOG_COLORS[level as LogLevel] || chalk.white;
      const timestampColor = chalk.gray;
      const levelColor = colorFunction(level.toUpperCase());

      // Option to add context or additional metadata
      const formattedTimestamp = timestampColor(`[${timestamp}]`);
      const formattedLevel = `[${levelColor}]`;

      return `${formattedTimestamp} ${formattedLevel} ${message}`;
    });

    // Configure winston logger with enhanced options
    this.logger = winston.createLogger({
      level: (process.env.LOG_LEVEL as LogLevel) || "info",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }), // Added milliseconds
        customFormat
      ),
      transports: [
        // Console transport with color support
        new transports.Console({
          format: combine(colorize({ all: true }), customFormat),
        }),
        // File transport (without colors)
        new transports.File({
          filename: "logs/app.log",
          format: combine(format.uncolorize(), customFormat),
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

// Optional: Expose color utilities if needed
export const LogColors = LOG_COLORS;
export const LogBackgroundColors = LOG_BG_COLORS;
