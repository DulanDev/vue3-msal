# example-with-pinia

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Testing against the local plugin source

By default this sample consumes the published `vue3-msal-plugin` from npm. To test your local working-tree changes to the plugin (without publishing), use [`npm link`](https://docs.npmjs.com/cli/v10/commands/npm-link).

### One-time setup

From the **plugin root** (the repo root), build and register the global link:

```sh
rm -rf lib && npm run build
npm link
```

From the **sample directory** (`samples/sample-with-pinia`), link the local plugin and dedupe shared deps so the plugin and the sample resolve to the same `vue` / `@azure/msal-browser` instances:

```sh
npm link vue3-msal-plugin
npm install @azure/msal-browser@^4.0.0
```

To avoid duplicate Vue / MSAL copies (which cause `useMsal()` to throw `cannot be called outside the setup() function` even when called inside setup), keep this `dedupe` entry in `vite.config.ts` while linked:

```ts
resolve: {
  alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  dedupe: ['vue', '@azure/msal-browser'],
},
```

### Rebuilding after plugin changes

Each time you edit plugin source, rebuild so the symlinked `lib/` reflects your changes, then restart the sample's dev server:

```sh
# from repo root
rm -rf lib && npm run build
# from samples/sample-with-pinia
npm run dev
```

### Unlink and restore the published package

```sh
# from samples/sample-with-pinia
npm unlink vue3-msal-plugin
npm install
# from repo root
npm unlink
```

> Note: replacing `vue3-msal-plugin` with `"file:../.."` in the sample's `package.json` is an alternative to `npm link` and survives `npm install` without needing to re-link. It still requires the `dedupe` setting above.
