<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useMsal, useMsalAuthentication } from 'vue3-msal-plugin'
import { InteractionType } from '@azure/msal-browser'
import type { UserInfo } from '~/types/index'

const { callMsGraph, loginRequest } = useMsal()
const { result } = useMsalAuthentication(InteractionType.Popup, loginRequest)

const msGraphData: Ref<UserInfo | null> = ref(null)

watch(result, async (newValue) => {
  if (newValue?.accessToken) {
    try {
      const response = await callMsGraph(newValue.accessToken)
      msGraphData.value = response
    } catch (error) {
      console.error(error)
    }
  }
})
</script>

<template>
  <div v-if="msGraphData" class="card">
    <h1 class="text-xl font-semibold tracking-tight">Profile</h1>
    <dl style="margin-top: 1rem;">
      <div class="row">
        <dt>Name</dt>
        <dd>{{ msGraphData.displayName }}</dd>
      </div>
      <div class="row">
        <dt>Job title</dt>
        <dd>{{ msGraphData.jobTitle || '—' }}</dd>
      </div>
      <div class="row">
        <dt>Mail</dt>
        <dd>{{ msGraphData.mail || '—' }}</dd>
      </div>
      <div class="row">
        <dt>Mobile</dt>
        <dd>{{ msGraphData.mobilePhone || '—' }}</dd>
      </div>
    </dl>
  </div>
  <div v-else class="card">
    <p class="muted">Loading…</p>
  </div>
</template>

<style scoped>
.text-xl {
  font-size: 1.25rem;
}
.font-semibold {
  font-weight: 600;
}
.tracking-tight {
  letter-spacing: -0.025em;
}
.row {
  display: grid;
  grid-template-columns: 8rem 1fr;
  gap: 1rem;
  padding: 0.625rem 0;
  border-bottom: 1px solid hsl(var(--border));
}
.row:last-child {
  border-bottom: none;
}
.row dt {
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
}
.row dd {
  margin: 0;
  font-size: 0.875rem;
}
</style>
