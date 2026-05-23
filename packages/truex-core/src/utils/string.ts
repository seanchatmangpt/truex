/**
 * Convert camelCase string to kebab-case.
 *
 * @param str - The camelCase string to convert
 * @returns The converted kebab-case string
 */
export function camelToKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Sanitize a string for security by escaping HTML special characters.
 *
 * @param str - The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeString(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, (s) => map[s]);
}
