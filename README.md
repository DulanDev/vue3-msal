<p align="center">
  <img width="280" src="https://github.com/DulanDev/vue3-msal/assets/15976939/e5d25e77-1e05-4278-97a7-c112b4a59412" alt="Vue 3 Msal Plugin Logo">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vue3-msal-plugin">
    <img src="https://img.shields.io/npm/v/vue3-msal-plugin" alt="npm">
  </a>
  <a href="https://www.npmjs.com/package/vue3-msal-plugin">
    <img src="https://img.shields.io/npm/dm/vue3-msal-plugin" alt="npm downloads">
  </a>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff" alt="TypeScript">
  <img src="https://img.shields.io/npm/l/vue3-msal-plugin" alt="MIT">
  <img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen" alt="Node">
</p>

<p align="center"> Vue 3 plugin for integrating Microsoft Authentication Library (MSAL) into your app, offering easy-to-use composables. </p>

## Requirements

- Node.js 20 or newer
- Vue 3.5 or newer
- [`@azure/msal-browser`](https://www.npmjs.com/package/@azure/msal-browser) 4 or newer

## Installation

To install the package, use the following npm command:

```sh
npm i vue3-msal-plugin
```

## Quick Start

```ts
// main.ts
import { createApp } from 'vue';
import { msalPlugin, msalInstance } from 'vue3-msal-plugin';
import type { Configuration } from '@azure/msal-browser';
import App from './App.vue';

const config: Configuration = { auth: { clientId: '...', authority: '...', redirectUri: '...' } };
const app = createApp(App);
app.use(msalPlugin, msalInstance(config));
app.mount('#app');
```

Then use the `useMsal` composable inside any component:

```ts
import { useMsal } from 'vue3-msal-plugin';

const { instance, accounts, inProgress } = useMsal();
```

See the [Configuration](#configuration) and [Composables](#composables) sections below for the full API.

## Sample Apps

You can check out the sample apps to see how to use this package.

1. [Vue 3 App with Pinia](https://github.com/DulanDev/vue3-msal/tree/main/samples/sample-with-pinia)
2. [Quasar App](https://github.com/DulanDev/vue3-msal/tree/main/samples/sample-with-quasar)
3. [Nuxt App](https://github.com/DulanDev/vue3-msal/tree/main/samples/sample-with-nuxt)

## Configuration

In your main.ts file, you need to initialize the plugin with your MSAL instance.

Await `initialize()` before any other MSAL call. MSAL Browser v4 only loads the `localStorage` cache during `initialize()`, so calling `getAllAccounts()` before it resolves throws `uninitialized_public_client_application` for a user who is already signed in.

```typescript
import { createApp } from 'vue';

import App from './App.vue';
import router from './router';

import { msalPlugin, msalInstance } from 'vue3-msal-plugin';
import type { Configuration, AuthenticationResult } from '@azure/msal-browser';
import { EventType } from '@azure/msal-browser';

// Define the configuration for the MSAL instance
// For more detailed usage and other available options, please refer to the official MSAL.js documentation - https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: import.meta.env.VITE_AUTHORITY,
    redirectUri: 'http://localhost:5173', // Must be registered as a SPA redirectURI on your app registration
    postLogoutRedirectUri: 'http://localhost:5173', // Must be registered as a SPA redirectURI on your app registration
  },
  cache: {
    cacheLocation: 'localStorage',
  },
};

async function bootstrap() {
  const app = createApp(App);

  // Create a new MSAL instance with the defined configuration
  const newMsalInstance = msalInstance(msalConfig);

  // MSAL Browser v4 loads the localStorage cache here, so it must finish before any other MSAL call
  await newMsalInstance.initialize();

  // Get all accounts from the MSAL instance
  const accounts = newMsalInstance.getAllAccounts();
  if (accounts.length > 0) {
    // If there are any accounts, set the first one as the active account
    newMsalInstance.setActiveAccount(accounts[0]);
  }

  // Add an event callback to the MSAL instance
  newMsalInstance.addEventCallback((event) => {
    // If the event is a successful login and the event has a payload
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      // Cast the payload to an AuthenticationResult
      const payload = event.payload as AuthenticationResult;
      // Get the account from the payload
      const account = payload.account;
      // Set the account as the active account in the MSAL instance
      newMsalInstance.setActiveAccount(account);

      /* Optionally, You can update the user store with the account data here.
      'account' refers to the account data obtained from the MSAL instance.
      updateUser(account)
      */
    }
  });

  app.use(router);

  // Use the vue3-msal-plugin with the MSAL instance
  app.use(msalPlugin, newMsalInstance);

  // Handle page refresh
  // Get the active account from the MSAL instance
  const activeAccount = newMsalInstance.getActiveAccount();
  if (activeAccount) {
    /* Optionally, you can update the user store with the account data here.
      'account' refers to the account data obtained from the MSAL instance.
      updateUser(activeAccount)
      */
  }

  app.mount('#app');
}

bootstrap();
```

## Composables

The plugin provides a `useMsal` composable that you can use in your components to access the MSAL instance and its related properties and methods. Here's an example:

```typescript
import { useMsal } from 'vue3-msal-plugin';

const { instance, accounts, inProgress } = useMsal();

console.log('instance', instance); // MSAL instance
console.log('accounts', accounts.value); // Array of account objects
console.log('inProgress', inProgress.value); // Authentication status
```

The `instance` is the MSAL instance, `accounts` is an array of account objects, and `inProgress` is a reactive property that indicates the authentication status.

The `useMsal` function also initializes the MSAL instance and handles redirect promises if the interaction status is `InteractionStatus.Startup`.

For login operations, a `loginRequest` object is used. It contains a `scopes` property which is an array of permission scopes. All parameters in the login requests are optional, so you can just send an empty object.

Read more about scopes [here.](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#scopes)

You can use these methods to perform various authentication operations:

```typescript
const { instance, accounts, inProgress, loginRequest } = useMsal();

const loginPopup = () => {
  instance.loginPopup(loginRequest);
};

const loginRedirect = () => {
  instance.loginRedirect(loginRequest);
};

const logoutPopup = () => {
  instance.logoutPopup({
    mainWindowRedirectUri: '/',
  });
};

const logoutRedirect = () => {
  instance.logoutRedirect();
};
```

### useIsAuthenticated

The `useIsAuthenticated` composable provides a reactive property that indicates whether the user is authenticated or not.

```typescript
import { useIsAuthenticated } from 'vue3-msal-plugin';

const isAuthenticated = useIsAuthenticated(); // Reactive property
```

You can use this property to conditionally render components or perform actions based on the authentication status of the user.

### useMsalAuthentication

The `useMsalAuthentication` composable from vue3-msal-plugin provides a way to handle authentication and acquire tokens using MSAL.

```typescript
import { useMsalAuthentication, InteractionType } from 'vue3-msal-plugin';

const { acquireToken, result, error, inProgress } = useMsalAuthentication(interactionType, request);
```

**`useMsalAuthentication` takes two parameters:**

- `interactionType`: This is of type InteractionType and it specifies the type of interaction to be used for authentication. It can be Popup, Redirect, or Silent.

- `request`: This is an object of type PopupRequest, RedirectRequest, or SilentRequest. It contains the parameters for the authentication request.

**`useMsalAuthentication` returns an object with the following properties:**

- `acquireToken`: This is a function that can be used to manually initiate the token acquisition process. It takes an optional requestOverride parameter which can be used to override the initial request parameters.

- `result`: This is a reactive property that holds the result of the authentication process. It will be null if the process has not completed or if an error occurred.

- `error`: This is a reactive property that holds any error that occurred during the authentication process. It will be null if no error occurred.

- `inProgress`: This is a reactive property that indicates whether the authentication process is currently in progress.

The `useMsalAuthentication` function automatically initiates the token acquisition process when it is called. If the process is not completed and no error occurred, it will be re-initiated whenever the global inProgress status changes.

Please note that `useMsalAuthentication` should only be called within the setup() function of a Vue component. Also, the MSAL plugin must be installed in your application. If these conditions are not met, useMsalAuthentication will throw an error.

### callMsGraph

#### Makes a GET request to the Microsoft Graph API

The `callMsGraph` function takes an access token as a parameter and returns a promise that resolves with the response data from the Microsoft Graph API.

You can see an example of how to use this function in here [MyProfile.vue](https://github.com/DulanDev/vue3-msal/blob/main/samples/sample-with-pinia/src/components/MyProfile.vue).

```typescript
import { ref, watch } from 'vue';
import type { Ref } from 'vue';
import { useMsal } from 'vue3-msal-plugin';
import type { AccountInfo } from '@azure/msal-browser';

const { callMsGraph } = useMsal();
type UserInfo = AccountInfo | null;

const msGraphData: Ref<UserInfo> = ref(null);

async function fetchData() {
  try {
    const response = await callMsGraph('your-access-token-here');
    msGraphData.value = response;
  } catch (error) {
    console.error(error);
  }
}

fetchData();
```

To obtain the access token, you can use the `result` from `useMsalAuthentication` composable.

## Migration from v1.0.x

v1.1.0 modernizes the build, dependency ranges, and type surface, but the documented public API and the code samples above are unchanged. To upgrade:

1. Bump `@azure/msal-browser` to `^4.0.0`. See the official [MSAL.js v4 migration guide](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser#migrating-from-previous-msal-versions) for behavioral changes (most notable: IE11 dropped, default `navigateToLoginRequestUrl` behavior changed).
2. Bump `vue` to `^3.5.0`.
3. Use Node.js 20 or newer (`engines.node: ">=20"` is now enforced on install).

No application code changes are needed if you are using the documented composables above. `$msal` remains available on Vue global properties for backward compatibility.

See [`CHANGELOG.md`](./CHANGELOG.md) for the full list of additions, fixes, and removed items.

## Acknowledgments

- [Microsoft Authentication Library for JavaScript (MSAL.js)](https://github.com/AzureAD/microsoft-authentication-library-for-js)

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Dulan Katukurundage - dulanhewage2@hotmail.com
