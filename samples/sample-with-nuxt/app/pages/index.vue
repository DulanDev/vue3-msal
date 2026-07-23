<script setup lang="ts">
import { computed } from 'vue'
import { useMsal } from 'vue3-msal-plugin'

const { accounts } = useMsal()

const account = computed(() => accounts.value[0] ?? null)

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight">Account</h1>
    <div v-if="account" class="card" style="margin-top: 1rem;">
      <dl>
        <div v-for="(value, key) in account" :key="key" class="row">
          <dt>{{ key }}</dt>
          <dd>
            <pre v-if="typeof value === 'object' && value !== null" class="code">{{
              formatValue(value)
            }}</pre>
            <template v-else>{{ value }}</template>
          </dd>
        </div>
      </dl>
    </div>
    <div v-else class="card" style="margin-top: 1rem;">
      <p class="muted">No account data.</p>
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
.row {
  display: grid;
  grid-template-columns: 12rem 1fr;
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
  word-break: break-word;
}
.code {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 0.75rem;
  white-space: pre-wrap;
  background-color: hsl(var(--muted));
  padding: 0.75rem;
  border-radius: calc(var(--radius) - 2px);
  overflow-x: auto;
}
</style>
