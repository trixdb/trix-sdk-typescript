/**
 * Version single-sourcing (#8).
 *
 * SDK_VERSION was hardcoded to `1.0.0` while package.json was `0.6.0` and the
 * release-please manifest `0.1.1` — a three-way drift stamped onto every
 * request via `User-Agent` / `X-SDK-Version`. These tests pin the version to a
 * single source (package.json) so telemetry and version-gating can't drift.
 */

import pkg from '../package.json';
import manifest from '../.release-please-manifest.json';
import { SDK_VERSION, buildHeaders } from '../src/client-request';

describe('SDK_VERSION single-sourcing', () => {
  it('equals the package.json version (no hardcoded drift)', () => {
    expect(SDK_VERSION).toBe(pkg.version);
  });

  it('is stamped onto the wire via User-Agent and X-SDK-Version', () => {
    const headers = buildHeaders('test_key');
    expect(headers['User-Agent']).toBe(`trix-typescript-sdk/${pkg.version}`);
    expect(headers['X-SDK-Version']).toBe(pkg.version);
  });

  it('matches the release-please manifest (release automation stays consistent)', () => {
    expect(manifest['.']).toBe(pkg.version);
  });
});
