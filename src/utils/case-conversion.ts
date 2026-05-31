/**
 * Convert object keys from camelCase to snake_case.
 *
 * Shallow only: keys at the top level are converted, but values pass through
 * untouched. This matters for `metadata`, `settings`, `tools`, and other
 * user-controlled bags where the inner shape is opaque and renaming a key
 * would corrupt the user's data.
 *
 * Idempotent: keys without internal capitalization (`space_id`, `tags`) are
 * returned unchanged, so it is safe to call this twice along the request
 * pipeline (per-resource then centralized in client-request).
 *
 * Pattern `[a-z0-9][A-Z]` ensures we only insert an underscore between a
 * lowercase/digit and an uppercase — so `spaceId` → `space_id`, but
 * `URLPath` collapses to `urlpath` rather than `_u_r_l_path`. The SDK does
 * not expose ALL_CAPS-prefixed identifiers as param keys today.
 */
const CAMEL_BOUNDARY = /([a-z0-9])([A-Z])/g;

export function toSnakeCaseKey(key: string): string {
  return key.replace(CAMEL_BOUNDARY, '$1_$2').toLowerCase();
}

export function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[toSnakeCaseKey(key)] = value;
  }
  return result;
}

/**
 * Type guard: is this a plain object whose keys we can safely rewrite?
 *
 * Excludes arrays, Dates, Maps, FormData, ArrayBuffers, etc. — they have
 * structural meaning and should pass through the SDK unchanged.
 */
export function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (v === null || typeof v !== 'object') return false;
  const proto = Object.getPrototypeOf(v);
  return proto === null || proto === Object.prototype;
}
