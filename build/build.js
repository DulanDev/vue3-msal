import { readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { build } from 'esbuild';

await rm('lib', { recursive: true, force: true });

const shared = {
  sourcemap: true,
  target: 'es2020',
  platform: 'browser',
};

// ESM: per-file transpile (no bundling) preserves named entry points so
// bundlers can tree-shake unused exports.  Each src file maps to a sibling
// in lib, and cross-src imports stay relative so `./types` resolves to
// `./types.js` under `"type": "module"`.
await build({
  ...shared,
  bundle: false,
  minify: true,
  entryPoints: ['src/index.ts', 'src/types.ts', 'src/msal-config.ts', 'src/vue3-msal-plugin.ts', 'src/helpers.ts'],
  outdir: 'lib',
  format: 'esm',
});

// CJS: single self-contained bundle for legacy `require` consumers.  All
// cross-src imports are inlined, avoiding the Node 20 ERR_REQUIRE_ESM issue
// that arises when CJS files try to `require()` sibling ESM `.js` outputs.
await build({
  ...shared,
  bundle: true,
  minify: true,
  external: ['vue', '@azure/msal-browser'],
  entryPoints: ['src/index.ts'],
  outfile: 'lib/index.cjs',
  format: 'cjs',
});

// esbuild's `bundle: false` leaves cross-src ESM imports extensionless
// (`from"./types"`).  Node's strict ESM loader rejects extensionless
// relative imports, so add `.js` to any relative specifiers that lack one.
// External bare specifiers (`vue`, `@azure/msal-browser`) are left alone.
const addJsExt = /(\bfrom"\.\/[^"]+")/g;
for (const f of await readdir('lib')) {
  if (!f.endsWith('.js')) continue;
  const path = `lib/${f}`;
  const src = await readFile(path, 'utf8');
  const rewritten = src.replace(addJsExt, (m, p1) => (p1.endsWith('.js"') ? m : `${p1.slice(0, -1)}.js"`));
  if (rewritten !== src) await writeFile(path, rewritten);
}
