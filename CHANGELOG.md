# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- `msalPlugin` no longer throws `uninitialized_public_client_application` when installed before `initialize()` resolves. With `cacheLocation: 'localStorage'`, MSAL Browser v4 only loads the encrypted cache during `initialize()`, so reading accounts earlier threw for returning users on every page refresh. The plugin now starts with an empty account list and syncs it once `initialize()` resolves.
- README Configuration example, Pinia sample, and Quasar sample now await `instance.initialize()` before reading accounts or installing the plugin.

## [1.1.1] - 2026-07-23

### Fixed

- `exports[\".\"].types` in `package.json` pointed to `./lib/types.d.ts` instead of `./lib/index.d.ts`, causing `has no exported member` errors for all runtime exports under modern module resolution.

## [1.1.0] - 2026-07-21

### Added

- Dual ESM + CJS output. ESM is emitted per-file (`lib/{index,types,msal-config,vue3-msal-plugin,helpers}.js`) so bundlers can tree-shake unused exports; a single bundled `lib/index.cjs` is provided for CommonJS consumers.
- `exports` field in `package.json` with `types`, `import`, and `require` conditions for `.` and `./types`.
- `"sideEffects": false` to enable safe tree-shaking.
- Vue module augmentation for `$msal` global property (previously commented out and untyped).
- Vitest regression suite (26 tests) across composables, plugin, helpers, and `callMsGraph`, with V8 coverage ≥80% on all metrics.
- ESLint 9 flat config (`eslint.config.js`) replacing the CJS `.eslintrc.js`. Prettier 3 with `eslint-config-prettier`.
- "Quick Start", "Requirements", and "Migration from v1.0.x" sections in the README.
- Sample apps document an `npm link` workflow for testing local plugin source.

### Changed

- Peer dependency `@azure/msal-browser` bumped from `^3.0.0` to `^4.0.0`.
- Peer dependency `vue` bumped from `^3.4.0` to `^3.5.0`.
- `engines.node: ">=20"` is now declared and enforced on install.
- TypeScript root `moduleResolution` switched to `bundler` with `verbatimModuleSyntax: true`; `allowImportingTsExtensions` removed.
- `main` field now points to `lib/index.cjs` (CommonJS) so legacy resolvers get CJS; `module` stays `lib/index.js` (ESM); `types` stays `lib/index.d.ts`.
- Build script (`build/build.js`) rewritten: per-file ESM transpile (with extension-rewriting post-process for Node strict ESM), single bundled CJS, and `lib/` cleanup at the start of every build.
- `lint` script switched to `eslint . --fix` flat-config invocation.
- Root devDependencies modernized: `@azure/msal-browser@4.30.0`, `vue@3.5.40`, `typescript@5.9.3`, `esbuild@0.28.1`, `eslint@9.39.5`, `@typescript-eslint/*@8.64.0`, `eslint-config-prettier@9.1.0`, `prettier@3.5.x`, `@types/node@20.19.x`.

### Fixed

- Circular `export * from './index.ts'` in `src/types.ts` removed; shared types now live in `types.ts` and are re-exported from `index.ts`.
- Emitted `.d.ts` files no longer reference `./index.ts` or any `.ts` import paths.
- `throw 'string'` replaced with `throw new Error(...)` throughout library code.
- `console.log` / `console.error` removed from library code.
- "Optioanlly" typos fixed in the README.

### Removed

- `lib/` build artifacts are no longer tracked in git (still shipped to npm via `"files": ["lib/*"]`).
- `.eslintrc.js` (CJS legacy config) removed; ESLint 9 flat config is the single source of truth.
- `eslint-plugin-prettier` and the deprecated `prettier/@typescript-eslint` chain removed.
- Empty `src/types/` directory removed.

### Migration from v1.0.x

v1.1.0 does not change any documented public API; sample code and README examples from v1.0.x continue to work verbatim. To upgrade:

1. Bump `@azure/msal-browser` to `^4.0.0`. Refer to the [MSAL.js v4 migration guide](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser#migration) for behavioral changes (most notable: IE11 dropped, default `navigateToLoginRequestUrl` behavior changed).
2. Bump `vue` to `^3.5.0`.
3. Use Node.js 20 or newer.
