<script setup lang="ts">
import { useIsAuthenticated, useMsal } from 'vue3-msal-plugin'

const { instance, loginRequest } = useMsal()
const isAuthenticated = useIsAuthenticated()

const loginPopup = () => {
  instance.loginPopup(loginRequest)
}

const loginRedirect = () => {
  instance.loginRedirect(loginRequest)
}

const logoutPopup = () => {
  instance.logoutPopup({
    mainWindowRedirectUri: '/',
  })
}

const logoutRedirect = () => {
  instance.logoutRedirect()
}
</script>

<template>
  <nav class="nav" aria-label="Main">
    <NuxtLink to="/" class="nav-brand">MSAL · Nuxt</NuxtLink>
    <ul class="nav-links">
      <li>
        <NuxtLink to="/">Home</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/profile">Profile</NuxtLink>
      </li>
    </ul>
    <div class="nav-actions">
      <template v-if="isAuthenticated">
        <button type="button" class="btn" @click="logoutPopup">Log out</button>
        <button type="button" class="btn btn-secondary" @click="logoutRedirect">
          Log out (redirect)
        </button>
      </template>
      <template v-else>
        <button type="button" class="btn" @click="loginPopup">Log in</button>
        <button type="button" class="btn btn-secondary" @click="loginRedirect">
          Log in (redirect)
        </button>
      </template>
    </div>
  </nav>
</template>
