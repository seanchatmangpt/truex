/**
 * @module object
 * @description Object manipulation and cloning utilities.
 * Gall Classification: S-2 (test utils / basic primitives).
 */

/**
 * Check if a value is a plain object.
 *
 * @param value - The value to check
 * @returns True if the value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, any> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/**
 * Deep clone an object without mutation of the original.
 *
 * @param value - The value to clone
 * @returns A deep clone of the value
 */
export function deepClone<T>(value: T): T {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => deepClone(item)) as unknown as T;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as unknown as T;
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as unknown as T;
  }

  if (isPlainObject(value)) {
    const result: Record<string, any> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = deepClone(value[key]);
      }
    }
    return result as T;
  }

  return value;
}

/**
 * Deeply merge source objects into a target object.
 * Mutates the target object.
 *
 * @param target - The target object
 * @param sources - Source objects to merge
 * @returns The merged target object
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: any[]): T {
  if (sources.length === 0) {
    return target;
  }

  const source = sources.shift();

  if (isPlainObject(target) && isPlainObject(source)) {
    for (const key in source) {
      if (isPlainObject(source[key])) {
        if (!target[key]) {
          (target as any)[key] = {};
        }
        deepMerge((target as any)[key], source[key]);
      } else {
        (target as any)[key] = deepClone(source[key]);
      }
    }
  }

  return deepMerge(target, ...sources);
}
