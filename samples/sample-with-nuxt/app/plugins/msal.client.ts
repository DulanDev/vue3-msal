import { msalPlugin, msalInstance } from 'vue3-msal-plugin'
import type { AuthenticationResult, Configuration, EventMessage } from '@azure/msal-browser'
import { EventType } from '@azure/msal-browser'

/**
 * Client-only MSAL setup.
 *
 * MSAL Browser and this plugin touch browser APIs (localStorage, redirects).
 * Registering as a .client plugin keeps SSR clean while components still use
 * useMsal / useIsAuthenticated after hydration.
 *
 * MSAL Browser v4 requires `await instance.initialize()` before any other
 * API call. The plugin awaits it before reading the account cache or
 * installing the Vue plugin, so components never see an uninitialized instance.
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()

  const msalConfig: Configuration = {
    auth: {
      clientId: String(runtimeConfig.public.clientId || ''),
      authority: String(runtimeConfig.public.authority || ''),
      // Must match a SPA redirect URI on your Azure app registration
      redirectUri: String(runtimeConfig.public.redirectUri || 'http://localhost:3000'),
      postLogoutRedirectUri: String(runtimeConfig.public.postLogoutRedirectUri || 'http://localhost:3000'),
    },
    cache: {
      cacheLocation: 'localStorage',
    },
  }

  const instance = msalInstance(msalConfig)

  await instance.initialize()

  const accounts = instance.getAllAccounts()
  const firstAccount = accounts[0] ?? null
  if (firstAccount) {
    instance.setActiveAccount(firstAccount)
  }

  instance.addEventCallback((event: EventMessage) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult
      instance.setActiveAccount(payload.account)
    }
  })

  nuxtApp.vueApp.use(msalPlugin, instance)
})
