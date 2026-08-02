/**
 * Case conversion + buildUrl serialization.
 *
 * Guards the contract relied on by every resource that uses camelCase params:
 *  - `spaceId` reaches the API as `space_id`
 *  - `spaceIds: [...]` reaches the API as `?space_ids=a,b` (CSV), not
 *    `?space_ids=a&space_ids=b` (Fastify keeps only the last value).
 *  - already-snake_case keys are idempotent.
 *  - nested user-bag values (metadata, settings) are NOT recursed into.
 */

import {
  toSnakeCase,
  toSnakeCaseKey,
  toCamelCaseKey,
  toCamelCaseDeep,
  isPlainObject,
} from '../src/utils/case-conversion';
import { buildUrl, handleResponse } from '../src/client-request';

describe('toSnakeCaseKey', () => {
  it('converts camelCase boundaries', () => {
    expect(toSnakeCaseKey('spaceId')).toBe('space_id');
    expect(toSnakeCaseKey('maxTokens')).toBe('max_tokens');
    expect(toSnakeCaseKey('createdAfter')).toBe('created_after');
  });

  it('is idempotent on already-snake_case keys', () => {
    expect(toSnakeCaseKey('space_id')).toBe('space_id');
    expect(toSnakeCaseKey('max_tokens')).toBe('max_tokens');
    expect(toSnakeCaseKey('tags')).toBe('tags');
  });

  it('handles digits in identifiers', () => {
    expect(toSnakeCaseKey('v2Endpoint')).toBe('v2_endpoint');
  });
});

describe('toSnakeCase', () => {
  it('rewrites top-level keys only — nested objects pass through unchanged', () => {
    const result = toSnakeCase({
      spaceId: 'abc',
      metadata: { camelInside: 'preserve me' },
    });
    expect(result).toEqual({
      space_id: 'abc',
      metadata: { camelInside: 'preserve me' },
    });
  });

  it('preserves array values', () => {
    const arr = ['a', 'b'];
    const result = toSnakeCase({ spaceIds: arr });
    expect(result.space_ids).toBe(arr);
  });
});

describe('isPlainObject', () => {
  it('accepts plain objects', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
  });

  it('rejects arrays, dates, null, primitives', () => {
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject('x')).toBe(false);
    expect(isPlainObject(42)).toBe(false);
  });
});

describe('toCamelCaseKey', () => {
  it('converts snake_case boundaries', () => {
    expect(toCamelCaseKey('space_id')).toBe('spaceId');
    expect(toCamelCaseKey('has_more')).toBe('hasMore');
    expect(toCamelCaseKey('max_turns_per_run')).toBe('maxTurnsPerRun');
    expect(toCamelCaseKey('actor_user_id')).toBe('actorUserId');
  });

  it('is idempotent on already-camelCase keys', () => {
    expect(toCamelCaseKey('spaceId')).toBe('spaceId');
    expect(toCamelCaseKey('tags')).toBe('tags');
  });

  it('handles digits and preserves a leading underscore', () => {
    expect(toCamelCaseKey('v2_endpoint')).toBe('v2Endpoint');
    expect(toCamelCaseKey('_id')).toBe('_id');
  });
});

describe('toCamelCaseDeep', () => {
  it('converts snake wire keys to camel typed fields, deeply', () => {
    const wire = {
      space_id: 'abc',
      created_at: 't',
      pagination: { has_more: true, total_results: 3 },
    };
    expect(toCamelCaseDeep(wire)).toEqual({
      spaceId: 'abc',
      createdAt: 't',
      pagination: { hasMore: true, totalResults: 3 },
    });
  });

  it('converts nested arrays of typed objects element-wise', () => {
    const wire = { data: [{ space_id: 'a' }, { space_id: 'b' }] };
    expect(toCamelCaseDeep(wire)).toEqual({
      data: [{ spaceId: 'a' }, { spaceId: 'b' }],
    });
  });

  it('camelCases the field name of an opaque bag but preserves its keys verbatim', () => {
    const wire = {
      event_filter: { user_defined_key: 1, nested: { another_key: 2 } },
      metadata: { keep_me: 'x' },
    };
    expect(toCamelCaseDeep(wire)).toEqual({
      eventFilter: { user_defined_key: 1, nested: { another_key: 2 } },
      metadata: { keep_me: 'x' },
    });
  });

  it('treats data/results structurally: array recurses, object is opaque', () => {
    // Object form (e.g. a webhook/enrichment payload bag) → keys preserved.
    expect(toCamelCaseDeep({ data: { raw_key: 1 } })).toEqual({ data: { raw_key: 1 } });
    // Array form (e.g. paginated list) → element keys converted.
    expect(toCamelCaseDeep({ results: [{ memory_id: 'm' }] })).toEqual({
      results: [{ memoryId: 'm' }],
    });
  });

  it('passes primitives, null, and bare arrays through', () => {
    expect(toCamelCaseDeep(null)).toBeNull();
    expect(toCamelCaseDeep(42)).toBe(42);
    expect(toCamelCaseDeep([{ a_b: 1 }])).toEqual([{ aB: 1 }]);
  });
});

describe('round-trip stability with toSnakeCase', () => {
  it('toCamelCaseDeep(toSnakeCase(x)) === x for SDK objects with opaque bags', () => {
    const sdkObject = {
      spaceId: 'abc',
      maxTokens: 10,
      tags: ['a', 'b'],
      metadata: { user_key: 1, nested: { deep_key: 2 } },
    };
    const roundTripped = toCamelCaseDeep(toSnakeCase(sdkObject));
    expect(roundTripped).toEqual(sdkObject);
  });
});

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('handleResponse case conversion', () => {
  it('camelCases a snake_case JSON response body', async () => {
    const result = await handleResponse<{ spaceId: string; createdAt: string }>(
      jsonResponse({ space_id: 'abc', created_at: '2026-01-01' })
    );
    expect(result).toEqual({ spaceId: 'abc', createdAt: '2026-01-01' });
  });

  it('preserves opaque bag contents while camelCasing the field name', async () => {
    const result = await handleResponse<{ metadata: Record<string, unknown> }>(
      jsonResponse({ metadata: { snake_stays: true } })
    );
    expect(result.metadata).toEqual({ snake_stays: true });
  });

  it('returns undefined for a 204 without touching the body', async () => {
    const res = {
      ok: true,
      status: 204,
      headers: new Headers(),
    } as unknown as Response;
    expect(await handleResponse(res)).toBeUndefined();
  });
});

describe('buildUrl query serialization', () => {
  const base = 'https://api.example.com';

  it('snake-cases camelCase param keys', () => {
    const url = buildUrl(base, '/v1/memories', { spaceId: 'abc', maxTokens: 10 });
    expect(url).toContain('space_id=abc');
    expect(url).toContain('max_tokens=10');
    expect(url).not.toContain('spaceId');
    expect(url).not.toContain('maxTokens');
  });

  it('serializes arrays as CSV (matches Trix API), not repeated keys', () => {
    const url = buildUrl(base, '/v1/memories', { spaceIds: ['a', 'b', 'c'] });
    expect(url).toContain('space_ids=a%2Cb%2Cc');
    // No repeated-key form — Fastify would keep only the last.
    const count = (url.match(/space_ids=/g) || []).length;
    expect(count).toBe(1);
  });

  it('skips null and undefined values', () => {
    const url = buildUrl(base, '/v1/memories', { q: 'hi', cursor: null, type: undefined });
    expect(url).toContain('q=hi');
    expect(url).not.toContain('cursor');
    expect(url).not.toContain('type');
  });

  it('skips empty arrays so the query string stays clean', () => {
    const url = buildUrl(base, '/v1/memories', { spaceIds: [] });
    expect(url).not.toContain('space_ids');
  });
});
