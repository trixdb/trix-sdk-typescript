/**
 * Package subpath exports must actually be built (#7).
 *
 * `package.json` advertised the `./testing` subpath export
 * (→ `./dist/testing/index.*`), but `tsup.config.ts` only built `src/index.ts`,
 * so `dist/testing/*` was never emitted and the documented
 * `import { MockTrix } from '@trixdb/client/testing'` failed with
 * module-not-found. This guards that every dist-bundle subpath export has a
 * matching tsup build entry (and, when a build is present, that it resolves).
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import pkg from '../package.json';

const ROOT = join(__dirname, '..');

interface SubpathTarget {
  types: string;
  require: string;
  import: string;
}

const distSubpaths = Object.entries(pkg.exports)
  .filter(([name]) => name !== '.')
  .map(([name, targets]) => ({ name, ...(targets as SubpathTarget) }));

describe('package subpath exports are actually built', () => {
  const tsupConfig = readFileSync(join(ROOT, 'tsup.config.ts'), 'utf8');

  it('declares the ./testing subpath export', () => {
    expect(distSubpaths.map((s) => s.name)).toContain('./testing');
  });

  it.each(distSubpaths)(
    'has a tsup build entry backing "$name"',
    ({ import: importPath }) => {
      // ./dist/testing/index.mjs -> src/testing/index.ts must be a tsup entry,
      // otherwise the advertised subpath resolves to a file that is never emitted.
      const match = importPath.match(/^\.\/dist\/(.+)\/index\.mjs$/);
      expect(match).not.toBeNull();
      const srcEntry = `src/${match![1]}/index.ts`;
      expect(existsSync(join(ROOT, srcEntry))).toBe(true);
      expect(tsupConfig).toContain(srcEntry);
    }
  );

  it.each(distSubpaths)(
    'resolves the built bundle for "$name" when dist is present',
    ({ require: requirePath }) => {
      const built = join(ROOT, requirePath);
      if (!existsSync(built)) {
        return; // No build in this environment; the entry check above still guards it.
      }
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(built);
      expect(Object.keys(mod).length).toBeGreaterThan(0);
    }
  );
});
