<script setup lang="ts">
import { useIsAuthenticated } from 'vue3-msal-plugin'

definePageMeta({ middleware: 'auth' })

const isAuthenticated = useIsAuthenticated()
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight">Profile</h1>
    <div v-if="isAuthenticated" style="margin-top: 1rem;">
      <MyProfile />
    </div>
    <div v-else class="card" style="margin-top: 1rem;">
      <p class="muted">You are logged out.</p>
      <p class="muted text-sm">
        Use <strong>Log in</strong> in the nav to sign in.
      </p>
    </div>
  </div>
</template>

<style scoped>
.text-2xl {
  font-size: 1.5rem;
}
.font-semibold {
  font-weight: 600;
}
.tracking-tight {
  letter-spacing: -0.025em;
}
</style>
