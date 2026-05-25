/**
 * @module proxy-log
 * @description Proxy wrapper for observing and logging object interactions.
 * Gall Classification: S-2 (test utils / basic primitives).
 */
import { log, LogLevel } from './log-format.js';

/**
 * Options for the logging proxy.
 */
export interface ProxyLogOptions {
  /** The log level to use. Defaults to INFO. */
  level?: LogLevel;
  /** A name to identify the proxy in logs. */
  name?: string;
}

/**
 * Creates a proxy that logs get, set, and deleteProperty operations.
 *
 * @param target - The object to proxy
 * @param options - Logging options
 * @returns A logging proxy
 */
export function createLoggingProxy<T extends object>(
  target: T,
  options: ProxyLogOptions = {}
): T {
  const { level = LogLevel.INFO, name = 'Proxy' } = options;

  return new Proxy(target, {
    get(target, prop, receiver) {
      log(level, `${name}: GET ${String(prop)}`, {
        property: prop,
        target: target
      });
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      log(level, `${name}: SET ${String(prop)}`, {
        property: prop,
        value: value,
        target: target
      });
      return Reflect.set(target, prop, value, receiver);
    },
    deleteProperty(target, prop) {
      log(level, `${name}: DELETE ${String(prop)}`, {
        property: prop,
        target: target
      });
      return Reflect.deleteProperty(target, prop);
    }
  });
}
