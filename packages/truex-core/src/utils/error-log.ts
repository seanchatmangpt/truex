/**
 * Default list of sensitive keys to redact from logs
 */
export const DEFAULT_REDACTED_KEYS = [
  'password',
  'secret',
  'token',
  'key',
  'authorization',
  'ssn',
  'creditCard',
  'salary',
  'apiKey',
  'privateKey',
  'credential'
];

/**
 * Sanitizes an object by redacting sensitive keys
 * @param data The data to sanitize
 * @param redactedKeys Keys that should be redacted
 * @returns A new object with sensitive keys redacted
 */
export function sanitize(data: any, redactedKeys: string[] = DEFAULT_REDACTED_KEYS, seen = new WeakSet()): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'bigint') {
    return data.toString();
  }

  if (typeof data === 'object') {
    if (seen.has(data)) {
      return '[Circular]';
    }
    seen.add(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitize(item, redactedKeys, seen));
  }

  if (typeof data === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = redactedKeys.some(k => key.toLowerCase().includes(k.toLowerCase())) ? '[REDACTED]' : sanitize(value, redactedKeys, seen);
    }
    return result;
  }

  return data;
}

/**
 * Formats an error cause chain into a list of messages and stacks
 * @param error The error to format
 * @returns An array of formatted error information
 */
export function getErrorChain(error: any): any[] {
  const chain: any[] = [];
  let current = error;

  while (current) {
    chain.push({
      message: current.message || String(current),
      name: current.name || 'Error',
      stack: current.stack
    });
    current = current.cause;
  }

  return chain;
}

/**
 * Logs an error with context and cause chain, while sanitizing sensitive data
 * @param error The error object
 * @param context Additional context for the error
 * @param options Logging options
 */
export function logError(
  error: any,
  context: Record<string, any> = {},
  options: {
    redactedKeys?: string[];
    logger?: { error: (...args: any[]) => void };
  } = {}
) {
  const { redactedKeys = DEFAULT_REDACTED_KEYS, logger = console } = options;

  const sanitizedContext = sanitize(context, redactedKeys);
  const errorChain = getErrorChain(error);

  const logPayload = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      name: error.name,
      stack: error.stack,
      chain: errorChain
    },
    context: sanitizedContext
  };

  logger.error('Error occurred:', JSON.stringify(logPayload, undefined, 2));
  
  return logPayload;
}
