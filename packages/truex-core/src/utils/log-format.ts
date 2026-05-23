/**
 * Log levels for filtering logs by severity.
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * Interface for log context objects.
 */
export interface LogContext {
  [key: string]: any;
}

let currentLogLevel = LogLevel.INFO;

/**
 * Sets the global log level.
 * @param level The log level to set.
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * Gets the current global log level.
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

/**
 * Safely stringifies an object, handling circular references.
 * @param obj The object to stringify.
 * @returns A JSON string representation of the object.
 */
export function safeStringify(obj: any): string {
  const cache = new WeakSet();
  return JSON.stringify(obj, (_key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular]';
      }
      cache.add(value);
    }
    return value;
  });
}

/**
 * Formats a log message with level, timestamp, and context.
 * Handles circular references in context objects gracefully.
 * 
 * @param level The severity level of the log.
 * @param message The log message.
 * @param context Optional context object to include in the log.
 * @returns The formatted log message string, or undefined if filtered by level.
 */
export function formatLog(level: LogLevel, message: string, context?: LogContext): string | undefined {
  if (level < currentLogLevel) {
    return undefined;
  }

  const timestamp = new Date().toISOString();
  const levelName = LogLevel[level];
  
  let formattedMessage = `[${timestamp}] ${levelName}: ${message}`;

  if (context && Object.keys(context).length > 0) {
    formattedMessage += ` | Context: ${safeStringify(context)}`;
  }

  return formattedMessage;
}

/**
 * Helper to log a message with context at a specific level.
 */
export function log(level: LogLevel, message: string, context?: LogContext): void {
  const formatted = formatLog(level, message, context);
  if (formatted === undefined) return;

  switch (level) {
    case LogLevel.DEBUG: {
      console.debug(formatted);
      break;
    }
    case LogLevel.INFO: {
      console.log(formatted);
      break;
    }
    case LogLevel.WARN: {
      console.warn(formatted);
      break;
    }
    case LogLevel.ERROR: {
      console.error(formatted);
      break;
    }
  }
}
