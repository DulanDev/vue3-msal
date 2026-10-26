import { shallowReactive } from 'vue';
import type { App, Plugin } from 'vue';
import {
  BrowserAuthError,
  BrowserAuthErrorCodes,
  EventMessageUtils,
  EventType,
  InteractionStatus,
  PublicClientApplication,
} from '@azure/msal-browser';
import type { AccountInfo, EventMessage } from '@azure/msal-browser';

import type { State } from './types';
import { accountArraysAreEqual } from './helpers';

/**
 * Reads the cached accounts, or returns null if the MSAL instance is not initialized yet.
 * MSAL Browser v4 only loads the localStorage cache during initialize(), so reading it
 * earlier throws for a returning user.
 * @param msalInstance
 */
function readAccounts(msalInstance: PublicClientApplication): AccountInfo[] | null {
  try {
    return msalInstance.getAllAccounts();
  } catch (e) {
    if (e instanceof BrowserAuthError && e.errorCode === BrowserAuthErrorCodes.uninitializedPublicClientApplication) {
      return null;
    }
    throw e;
  }
}

export const msalPlugin: Plugin = {
  install: (app: App, msalInstance: PublicClientApplication) => {
    // Initializing the interaction status and accounts
    const inProgress: InteractionStatus = InteractionStatus.Startup;
    const accounts = readAccounts(msalInstance);

    // Creating a reactive state
    const state = shallowReactive<State>({
      instance: msalInstance,
      inProgress: inProgress,
      accounts: accounts ?? [],
    });

    // Adding the state to the global properties of the Vue app
    app.config.globalProperties.$msal = state;

    // The instance was installed before initialize() resolved, so sync the accounts once it has
    if (accounts === null) {
      msalInstance
        .initialize()
        .then(() => {
          const currentAccounts = msalInstance.getAllAccounts();
          if (!accountArraysAreEqual(currentAccounts, state.accounts)) {
            state.accounts = currentAccounts;
          }
        })
        .catch(() => {
          // Initialization errors surface again when useMsal() calls initialize()
        });
    }

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
