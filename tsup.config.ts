import { defineConfig } from 'tsup';

export default defineConfig({
  // Multi-entry so the advertised `@trixdb/client/testing` subpath export
  // (package.json → ./dist/testing/index.*) is actually emitted, not just the
  // root bundle. tsup mirrors the entry tree under dist/ from the common src/ base.
  entry: ['src/index.ts', 'src/testing/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  target: 'es2020',
});
