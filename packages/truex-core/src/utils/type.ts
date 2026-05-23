/**
 * Checks if a value is a function.
 * 
 * @param val - The value to check.
 * @returns True if the value is a function, false otherwise.
 */
export function isFunction(val: unknown): val is (...args: any[]) => any {
  return typeof val === 'function';
}

/**
 * Checks if a value is a primitive.
 * Primitives include: string, number, boolean, symbol, bigint, null, and undefined.
 * 
 * @param val - The value to check.
 * @returns True if the value is a primitive, false otherwise.
 */
export function isPrimitive(val: unknown): boolean {
  if (val === null) return true;
  const type = typeof val;
  return type !== 'object' && type !== 'function';
}

/**
 * Checks if a value is an object (excluding null).
 * 
 * @param val - The value to check.
 * @returns True if the value is an object, false otherwise.
 */
export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object';
}

/**
 * Checks if a value is a plain object (i.e., created with {} or new Object()).
 * 
 * @param val - The value to check.
 * @returns True if the value is a plain object, false otherwise.
 */
export function isPlainObject(val: unknown): val is Record<any, any> {
  if (!isObject(val)) return false;
  const proto = Object.getPrototypeOf(val);
  return proto === null || proto === Object.prototype;
}

/**
 * Returns the precise type of a value as a lowercase string.
 * Examples: 'array', 'date', 'regexp', 'map', 'set', 'null', 'undefined', 'object', 'function', etc.
 * 
 * @param val - The value to get the type of.
 * @returns The lowercase string representation of the value's type.
 */
export function getType(val: unknown): string {
  if (val === null) return 'null';
  if (typeof val !== 'object' && typeof val !== 'function') return typeof val;
  
  const toString = Object.prototype.toString.call(val);
  return toString.slice(8, -1).toLowerCase();
}
