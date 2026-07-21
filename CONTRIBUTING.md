# Contributing to vue3-msal-plugin

Thanks for taking the time to contribute! This document covers the canonical commands, branch flow, and PR expectations.

## Development environment

Requirements:

- Node.js 20 or newer
- npm (bundled with Node)

Clone the repo and install dependencies at the root:

```sh
git clone https://github.com/DulanDev/vue3-msal.git
cd vue3-msal
npm install
```

## Canonical commands

Run these from the repository root before opening a PR. All of them must be green:

```sh
npm run lint             # ESLint 9 flat config with --fix
npm test                 # vitest run (26 tests, jsdom environment)
npm run test:coverage    # vitest with v8 coverage — ≥80% thresholds enforced on src/**
npm run build            # esbuild (ESM + CJS) + tsc for .d.ts generation
```

`npm run build` regenerates `lib/`. The `lib/` directory is gitignored — do not commit build artifacts.

## Branch flow

- `main` is the shippable branch. It must stay green against the canonical commands above.
- Feature work and modernization happen on dedicated branches (e.g. `refactor/modernize`, `v1.1.0/critical-fixes-and-tests`).
- Open a pull request against `main` for review.

## Working on the plugin and testing it in a sample app

The two sample apps under `samples/sample-with-pinia` and `samples/sample-with-quasar` consume a published version of `vue3-msal-plugin` by default. To test your working-tree changes against a sample without publishing, use [`npm link`](https://docs.npmjs.com/cli/v10/commands/npm-link). Both sample READMEs document the exact workflow — see:

- [`samples/sample-with-pinia/README.md`](./samples/sample-with-pinia/README.md#testing-against-the-local-plugin-source)
- [`samples/sample-with-quasar/README.md`](./samples/sample-with-quasar/README.md#testing-against-the-local-plugin-source)

When linked, both samples require a `dedupe: ['vue', '@azure/msal-browser']` entry in their Vite config so the plugin and the sample resolve to the same copies of Vue and MSAL.

## Coding conventions

- TypeScript strict types — no `any` unless clearly justified.
- Don't add `console.log` or `console.error` to library code. Throw `Error` objects instead.
- Use `import type { ... }` for type-only imports. The repo runs with `verbatimModuleSyntax: true`.
- Unused function arguments prefixed with `_` are ignored by ESLint; everything else must be used or removed.
- Format with Prettier 3 (`npm run prettier`). Lint with ESLint 9 (`npm run lint`).

## Pull request expectations

- The PR title follows [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `fix(composable): ...`, `docs: ...`, `build: ...`).
- Lint, tests, and build are green on the PR branch.
- No `lib/` artifacts in the diff — `lib/` is gitignored and regenerated at build time.
- New behavior is covered by tests.
- User-facing changes are recorded in [`CHANGELOG.md`](./CHANGELOG.md) under the `[Unreleased]` section.
- Public API signatures are not broken. If a breaking change is unavoidable, open an issue first and discuss the migration path.

## Releasing

Releases are currently manual and performed by the maintainer. The `release:major` / `release:minor` / `release:patch` npm scripts depend on a global `semver` CLI installation; until Phase 2.6 replaces them with the built-in `npm version`, use the manual sequence:

```sh
npm version <patch|minor|major>
npm run build
npm publish --tag latest
git push origin main --follow-tags
# Create a GitHub Release from the new tag, using the relevant CHANGELOG section as release notes.
```

See [`plans/release-v1.1.0.md`](./plans/release-v1.1.0.md) for the full release checklist that was used for v1.1.0.
