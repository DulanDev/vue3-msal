import { shallowReactive } from 'vue';
import type { App, Plugin } from 'vue';
import { EventMessageUtils, EventType, InteractionStatus, PublicClientApplication } from '@azure/msal-browser';
import type { EventMessage } from '@azure/msal-browser';

import type { State } from './types';
import { accountArraysAreEqual } from './helpers';

export const msalPlugin: Plugin = {
  install: (app: App, msalInstance: PublicClientApplication) => {
    // Initializing the interaction status and accounts
    const inProgress: InteractionStatus = InteractionStatus.Startup;
    const accounts = msalInstance.getAllAccounts();

    // Creating a reactive state
    const state = shallowReactive<State>({
      instance: msalInstance,
      inProgress: inProgress,
      accounts: accounts,
    });

    // Adding the state to the global properties of the Vue app
    app.config.globalProperties.$msal = state;

    // Adding an event callback to the MSAL instance
    msalInstance.addEventCallback((message: EventMessage) => {
      switch (message.eventType) {
        case EventType.ACCOUNT_ADDED:
        case EventType.ACCOUNT_REMOVED:
        case EventType.LOGIN_SUCCESS:
        case EventType.SSO_SILENT_SUCCESS:
        case EventType.HANDLE_REDIRECT_END:
        case EventType.LOGIN_FAILURE:
        case EventType.SSO_SILENT_FAILURE:
        case EventType.LOGOUT_END:
        case EventType.ACQUIRE_TOKEN_SUCCESS:
        case EventType.ACQUIRE_TOKEN_FAILURE: {
          // Updating the accounts in the state when an account-related event occurs
          const currentAccounts = msalInstance.getAllAccounts();
          if (!accountArraysAreEqual(currentAccounts, state.accounts)) {
            state.accounts = currentAccounts;
          }
          break;
        }
      }
      // Updating the interaction status in the state when an interaction-related event occurs
      const status = EventMessageUtils.getInteractionStatusFromEvent(message, state.inProgress);
      if (status !== null) {
        state.inProgress = status;
      }
    });
  },
};
