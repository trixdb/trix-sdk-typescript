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
  isPlainObject,
} from '../src/utils/case-conversion';
import { buildUrl } from '../src/client-request';

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
