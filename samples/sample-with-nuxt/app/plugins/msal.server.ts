import { shallowReactive } from 'vue'
import { InteractionStatus } from '@azure/msal-browser'
import type { AccountInfo, PublicClientApplication } from '@azure/msal-browser'
import type { State } from 'vue3-msal-plugin'

/**
 * Server-side MSAL stub.
 *
 * MSAL Browser needs window/localStorage, so it only runs on the client
 * (see msal.client.ts). During SSR this plugin installs a reactive `$msal`
 * with an empty accounts array so `useMsal` / `useIsAuthenticated` resolve
 * without throwing and components render a logged-out shell.
 *
 * Components that need the real MSAL instance (login popups, token
 * acquisition) run their MSAL calls in event handlers or watchers that fire
 * after hydration on the client.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const ssrInstance = new Proxy({} as PublicClientApplication, {
    get(_target, prop) {
      if (prop === 'getAllAccounts') return (): AccountInfo[] => []
      if (prop === 'getActiveAccount') return (): AccountInfo | null => null
      return () =>
        Promise.reject(new Error(`MSAL "${String(prop)}" not available during SSR`))
    },
  }) as PublicClientApplication

  const state = shallowReactive<State>({
    instance: ssrInstance,
    inProgress: InteractionStatus.None,
    accounts: [],
  })

  nuxtApp.vueApp.config.globalProperties.$msal = state
})