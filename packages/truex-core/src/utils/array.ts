/**
 * A recursive array type for deep nesting.
 */
export type RecursiveArray<T> = Array<T | RecursiveArray<T>>;

/**
 * Flattens a nested array to a single level.
 * 
 * @param arr - The deeply nested array to flatten.
 * @returns A new flattened array.
 */
export function flatten<T>(arr: any[]): T[] {
  return arr.flat(Infinity) as T[];
}

/**
 * Deduplicates array elements by removing duplicates.
 * 
 * @param arr - The array to deduplicate.
 * @returns A new array with unique elements.
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Finds common elements between multiple arrays.
 * 
 * @param arrays - The arrays to intersect.
 * @returns A new array containing common elements found in all input arrays.
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) {
    return [];
  }
  
  let result = [...arrays[0]!];
  for (let i = 1; i < arrays.length; i++) {
    const set = new Set(arrays[i]);
    result = result.filter(item => set.has(item));
  }
  return result;
}
