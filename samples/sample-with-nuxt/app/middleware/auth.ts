/**
 * Client-side auth guard for protected routes.
 *
 * Server cannot know the MSAL account state (auth cache lives in
 * localStorage), so the guard only enforces on the client after hydration.
 * On the server the route renders its own "logged out" fallback.
 *
 * `useMsal` / `useIsAuthenticated` rely on `getCurrentInstance()`, which is
 * null in route middleware. Read `$msal` from the Nuxt app directly instead.
 */
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const nuxtApp = useNuxtApp()
  const accounts = nuxtApp.vueApp.config.globalProperties.$msal?.accounts
  if (!accounts || accounts.length === 0) {
    return navigateTo('/')
  }
})