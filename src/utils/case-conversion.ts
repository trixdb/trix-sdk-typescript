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

/**
 * Convert a single snake_case key to camelCase — the inverse of
 * {@link toSnakeCaseKey}. `space_id` → `spaceId`, `has_more` → `hasMore`.
 *
 * Idempotent on keys without an internal `_x` boundary (`spaceId` → `spaceId`,
 * `tags` → `tags`), so it is safe on already-camelCase input and round-trips
 * with the outbound converter. A leading underscore is preserved (`_id` stays
 * `_id`) so Mongo-style ids aren't mangled.
 */
const SNAKE_BOUNDARY = /_+([a-z0-9])/g;

export function toCamelCaseKey(key: string): string {
  return key.replace(SNAKE_BOUNDARY, (match, chr: string, offset: number) =>
    offset === 0 ? match : chr.toUpperCase()
  );
}

/**
 * Keys whose VALUES are opaque bags — user- or API-controlled maps with
 * arbitrary inner keys (`metadata`, per-tag/per-type aggregation counts, …).
 * Rewriting those inner keys would corrupt data, so the recursion stops here
 * and passes the value through verbatim. The field NAME is still camelCased;
 * only the value is left untouched.
 *
 * This mirrors the outbound guarantee: `toSnakeCase` is shallow, so on the way
 * out these nested bags are never recursed into either. The two directions are
 * therefore symmetric and a request→wire→response round-trip is stable.
 *
 * Listed in snake_case (the wire form); lookups normalize with
 * {@link toSnakeCaseKey} so an already-camel key matches too.
 */
const OPAQUE_KEYS = new Set<string>([
  // Free-form user/API bags
  'metadata', 'source_metadata', 'provider_metadata',
  'settings', 'config', 'properties', 'context', 'content',
  'args', 'input', 'input_context',
  'trigger', 'steps', 'step_states', 'step_overrides',
  'event_filter', 'checkpoint_data', 'schema', 'patch', 'previous_value',
  'defaults', 'overrides', 'effective', 'result',
  // Aggregation / permission maps (arbitrary string keys → scalars)
  'permissions', 'facets', 'factors', 'stages',
  'by_type', 'by_tag', 'by_event', 'by_space',
]);

/**
 * Overloaded keys that are a typed array in some responses (recurse into each
 * element) and an opaque bag in others (pass through). Disambiguated
 * structurally by {@link Array.isArray}, never by name alone.
 */
const STRUCTURAL_KEYS = new Set<string>(['data', 'results']);

/** Decide how to convert a value given the (wire) key that held it. */
function convertValue(snakeKey: string, value: unknown): unknown {
  if (OPAQUE_KEYS.has(snakeKey)) return value;
  if (STRUCTURAL_KEYS.has(snakeKey) && !Array.isArray(value)) return value;
  return toCamelCaseDeep(value);
}

/**
 * Recursively convert snake_case keys of a parsed JSON response to camelCase.
 *
 * Arrays are mapped element-wise; plain objects have their keys camelCased and
 * their values converted, EXCEPT for opaque bags ({@link OPAQUE_KEYS}) and
 * non-array `data`/`results`, whose values pass through untouched. Primitives,
 * `Date`s, and other non-plain values are returned as-is.
 */
export function toCamelCaseDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toCamelCaseDeep);
  if (!isPlainObject(value)) return value;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    result[toCamelCaseKey(key)] = convertValue(toSnakeCaseKey(key), val);
  }
  return result;
}
