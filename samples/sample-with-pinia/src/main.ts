import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { msalPlugin, msalInstance } from 'vue3-msal-plugin'
import type { Configuration, AuthenticationResult } from '@azure/msal-browser'
import { EventType } from '@azure/msal-browser'

import { useUserStore } from './stores/user'

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: import.meta.env.VITE_AUTHORITY,
    redirectUri: 'http://localhost:5173', // Must be registered as a SPA redirectURI on your app registration
    postLogoutRedirectUri: 'http://localhost:5173' // Must be registered as a SPA redirectURI on your app registration
  },
  cache: {
    cacheLocation: 'localStorage'
  }
}

async function bootstrap() {
  const app = createApp(App)

  // Create a new MSAL instance with the defined configuration
  const newMsalInstance = msalInstance(msalConfig)

  // MSAL Browser v4 loads the localStorage cache here, so it must finish before any other MSAL call
  await newMsalInstance.initialize()

  // Get all accounts from the MSAL instance
  const accounts = newMsalInstance.getAllAccounts()
  if (accounts.length > 0) {
    // If there are any accounts, set the first one as the active account
    newMsalInstance.setActiveAccount(accounts[0])
  }

  app.use(createPinia())
  app.use(router)
  const { updateUser } = useUserStore()

  // Add an event callback to the MSAL instance
  newMsalInstance.addEventCallback((event) => {
    // If the event is a successful login and the event has a payload
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      // Cast the payload to an AuthenticationResult
      const payload = event.payload as AuthenticationResult
      // Get the account from the payload
      const account = payload.account
      // Set the account as the active account in the MSAL instance
      newMsalInstance.setActiveAccount(account)

      /* Optioanlly, You can update the user store with the account data here.
      'account' refers to the account data obtained from the MSAL instance.
      */
      updateUser(account)
    }
  })

  // Use the vue3-msal plugin with the MSAL instance
  app.use(msalPlugin, newMsalInstance)

  // Handle page refresh
  // Get the active account from the MSAL instance
  const activeAccount = newMsalInstance.getActiveAccount()
  if (activeAccount) {
    /* Optioanlly, you can update the user store with the account data here.
      'account' refers to the account data obtained from the MSAL instance.
      */
    updateUser(activeAccount)
  }

  app.mount('#app')
}

bootstrap()
