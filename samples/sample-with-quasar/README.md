## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

## Testing against the local plugin source

By default this sample consumes the published `vue3-msal-plugin` from npm. To test your local working-tree changes to the plugin (without publishing), use [`npm link`](https://docs.npmjs.com/cli/v10/commands/npm-link).

### One-time setup

From the **plugin root** (the repo root), build and register the global link:

```sh
rm -rf lib && npm run build
npm link
```

From the **sample directory** (`samples/sample-with-quasar`), link the local plugin and dedupe shared deps so the plugin and the sample resolve to the same `vue` / `@azure/msal-browser` instances:

```sh
npm link vue3-msal-plugin
npm install @azure/msal-browser@^4.0.0
```

To avoid duplicate Vue / MSAL copies (which cause `useMsal()` to throw `cannot be called outside the setup() function` even when called inside setup), enable a `dedupe` entry in `quasar.config.js` while linked:

```js
build: {
  extendViteConf(viteConf) {
    viteConf.resolve = viteConf.resolve || {};
    viteConf.resolve.dedupe = ['vue', '@azure/msal-browser'];
  },
},
```

### Rebuilding after plugin changes

Each time you edit plugin source, rebuild so the symlinked `lib/` reflects your changes, then restart the sample's dev server:

```sh
# from repo root
rm -rf lib && npm run build
# from samples/sample-with-quasar
quasar dev
```

### Unlink and restore the published package

```sh
# from samples/sample-with-quasar
npm unlink vue3-msal-plugin
npm install
# from repo root
npm unlink
```

> Note: replacing `vue3-msal-plugin` with `"file:../.."` in the sample's `package.json` is an alternative to `npm link` and survives `npm install` without needing to re-link. It still requires the `dedupe` setting above.
