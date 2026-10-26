import { boot } from 'quasar/wrappers';
import { msalPlugin, msalInstance } from 'vue3-msal-plugin/lib';
import type { AuthenticationResult } from '@azure/msal-browser';
import { EventType } from '@azure/msal-browser';
import { msalConfig } from 'src/authConfig';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
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

  newMsalInstance.addEventCallback((event) => {
    // If the event is a successful login and the event has a payload
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      // Cast the payload to an AuthenticationResult
      const payload = event.payload as AuthenticationResult;
      // Get the account from the payload
      const account = payload.account;
      // Set the account as the active account in the MSAL instance
      newMsalInstance.setActiveAccount(account);
    }
  });

  // Use the vue3-msal plugin with the MSAL instance
  app.use(msalPlugin, newMsalInstance);
});
