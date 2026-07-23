# sample-with-nuxt

Nuxt sample for [`vue3-msal-plugin`](https://www.npmjs.com/package/vue3-msal-plugin).

Demonstrates the same auth flows as `sample-with-pinia`, adapted for Nuxt SSR:

- Login / logout via **popup** and **redirect**
- Home page account data from MSAL accounts
- Profile page that acquires a token and calls Microsoft Graph `/me`
- SSR pages render on the server; MSAL is hydrated on the client
- Client-only route middleware guarding `/profile`

## Requirements

- Node.js 20+
- An Azure AD app registration (SPA) with redirect URI `http://localhost:3000`

## Project setup

```sh
cd samples/sample-with-nuxt
cp .env.example .env
# Edit .env with your Azure client ID and authority
npm install
```

### Environment variables

| Variable                               | Description                                            |
| -------------------------------------- | ------------------------------------------------------ |
| `NUXT_PUBLIC_CLIENT_ID`                | Azure AD application (client) ID                       |
| `NUXT_PUBLIC_AUTHORITY`                | e.g. `https://login.microsoftonline.com/<tenant-id>`   |
| `NUXT_PUBLIC_REDIRECT_URI`             | SPA redirect URI (default `http://localhost:3000`)     |
| `NUXT_PUBLIC_POST_LOGOUT_REDIRECT_URI` | Post-logout redirect (default `http://localhost:3000`) |

Register these SPA redirect URIs on your app registration:

- `http://localhost:3000`
- (optional) production origin if you deploy the sample

### Develop

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build & preview

```sh
npm run build
npm run preview
```

## How MSAL is wired in Nuxt (SSR)

MSAL Browser depends on `window` and `localStorage`, so it cannot run on the
server. This sample uses a **dual-plugin** pattern so the Vue app has a
consistent `$msal` reactive state on both server and client:

1. **`plugins/msal.server.ts`** — installs a lightweight stub `$msal` with an
   empty accounts array via a `Proxy`. `useMsal` / `useIsAuthenticated` resolve
   without throwing; `getAllAccounts` returns `[]` so SSR renders a logged-out
   shell. Any method that needs the real MSAL instance rejects with a clear
   error — those calls only happen after hydration.
2. **`plugins/msal.client.ts`** — creates the real MSAL instance with
   `runtimeConfig.public` values, sets the active account from the existing
   cache, listens for `LOGIN_SUCCESS`, and installs `msalPlugin` on the Vue
   app. This replaces the server stub on the client.
3. **`app.vue`** — no `<ClientOnly>` wrappers. Pages render on the server with
   the stub state; after hydration the real client plugin takes over and the
   reactive `accounts` ref updates — Vue reconciles the authenticated state.
4. **`middleware/auth.ts`** — client-only route guard. Because the server
   cannot know the MSAL account state (cache lives in `localStorage`), the
   guard skips on the server (`import.meta.server`) and enforces only after
   hydration. `/profile` declares `definePageMeta({ middleware: 'auth' })`.

### Caveat: flash of unauthenticated content

Because the MSAL token cache is browser-only, the server always renders a
logged-out shell. On the first client paint the user appears logged out, then
the real MSAL state hydrates and the UI flips to authenticated. This is
inherent to `@azure/msal-browser`'s storage model.

Eliminating the flash requires bridging auth state to the server (e.g. an
httpOnly cookie read by Nuxt server middleware and used to seed the SSR
`accounts`). That is out of scope for this sample; a dedicated Nuxt module
would own that bridge.

## Stack

- Nuxt 4 (SSR)
- TypeScript
- `vue3-msal-plugin` + `@azure/msal-browser` from npm

## Testing against a local plugin build

By default this sample uses the published package. To try local plugin changes without publishing:

```sh
# from repo root
rm -rf lib && npm run build
npm link

# from samples/sample-with-nuxt
npm link vue3-msal-plugin
npm run dev
```

Or set `"vue3-msal-plugin": "file:../.."` in this sample’s `package.json` and run `npm install`.

## Azure notes

Popup and redirect login require a valid client ID and authority. Placeholder values from `.env.example` are enough to boot the UI for smoke testing; real sign-in needs a configured app registration with the `User.Read` permission for the Graph profile page.
