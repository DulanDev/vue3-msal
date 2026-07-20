import { InteractionStatus, InteractionType } from '@azure/msal-browser';
import type {
  AuthenticationResult,
  AuthError,
  PopupRequest,
  RedirectRequest,
  SilentRequest,
} from '@azure/msal-browser';
import { getCurrentInstance, toRefs, watch, ref } from 'vue';
import type { Ref } from 'vue';
import type { MsalContext, MsalAuthenticationResult } from './types';

import { msalInstance } from './msal-config';
import { msalPlugin } from './vue3-msal-plugin';

export type { AccountIdentifiers, State, MsalContext, MsalAuthenticationResult, MsalPluginOptions } from './types';

// Define default login request
const loginRequest = {
  scopes: ['User.Read'],
};

/**
 * Provides access to the MSAL instance, user accounts, and interaction status.
 * @throws {Error} If called outside the setup() function of a component or if the MSAL plugin is not installed.
 * @returns {MsalContext} The MSAL context.
 */
export function useMsal(): MsalContext {
  const internalInstance = getCurrentInstance();
  if (!internalInstance) {
    throw new Error('useMsal() cannot be called outside the setup() function of a component');
  }
  const { instance, accounts, inProgress } = toRefs(internalInstance.appContext.config.globalProperties.$msal);

  if (!instance.value || !accounts.value || !inProgress.value) {
    throw new Error('Please install the msalPlugin');
  }

  if (inProgress.value === InteractionStatus.Startup) {
    instance.value.initialize().then(() => {
      instance.value.handleRedirectPromise().catch(() => {
        // Errors should be handled by listening to the LOGIN_FAILURE event
      });
    });
  }

  return {
    instance: instance.value,
    accounts,
    inProgress,
    loginRequest,
    callMsGraph,
  };
}

/**
 * Returns a reactive reference to a boolean indicating whether the user is authenticated.
 * @returns {Ref<boolean>} A reference to a boolean indicating whether the user is authenticated.
 */
export function useIsAuthenticated(): Ref<boolean> {
  const { accounts } = useMsal();
  const isAuthenticated = ref(accounts.value.length > 0);

  watch(accounts, () => {
    isAuthenticated.value = accounts.value.length > 0;
  });

  return isAuthenticated;
}

/**
 * Returns an object with methods for acquiring a token and reactive references to the authentication result, any error, and whether an authentication process is in progress.
 * @param {InteractionType} interactionType The type of interaction to use for authentication.
 * @param {PopupRequest | RedirectRequest | SilentRequest} request The request object for authentication.
 * @returns {MsalAuthenticationResult} The result of the authentication process.
 */
export function useMsalAuthentication(
  interactionType: InteractionType,
  request: PopupRequest | RedirectRequest | SilentRequest,
): MsalAuthenticationResult {
  const { instance, inProgress } = useMsal();

  const localInProgress = ref<boolean>(false);
  const result = ref<AuthenticationResult | null>(null);
  const error = ref<AuthError | null>(null);

  const acquireToken = async (requestOverride?: PopupRequest | RedirectRequest | SilentRequest) => {
    if (!localInProgress.value) {
      localInProgress.value = true;
      const tokenRequest = requestOverride || request;

      if (inProgress.value === InteractionStatus.Startup || inProgress.value === InteractionStatus.HandleRedirect) {
        try {
          const response = await instance.handleRedirectPromise();
          if (response) {
            result.value = response;
            error.value = null;
            return;
          }
        } catch (e) {
          result.value = null;
          error.value = e as AuthError;
          return;
        }
      }

      try {
        const response = await instance.acquireTokenSilent(tokenRequest);
        result.value = response;
        error.value = null;
      } catch {
        if (inProgress.value !== InteractionStatus.None) {
          return;
        }

        if (interactionType === InteractionType.Popup) {
          instance
            .loginPopup(tokenRequest)
            .then((response) => {
              result.value = response;
              error.value = null;
            })
            .catch((e) => {
              error.value = e;
              result.value = null;
            });
        } else if (interactionType === InteractionType.Redirect) {
          await instance.loginRedirect(tokenRequest).catch((e) => {
            error.value = e;
            result.value = null;
          });
        }
      }
      localInProgress.value = false;
    }
  };

  const stopWatcher = watch(inProgress, () => {
    if (!result.value && !error.value) {
      acquireToken();
    } else {
      stopWatcher();
    }
  });

  acquireToken();

  return {
    acquireToken,
    result,
    error,
    inProgress: localInProgress,
  };
}

// Define the configuration for the Graph API
const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};

/**
 * Makes a GET request to the Microsoft Graph API.
 * @param {string} accessToken The access token to use for the request.
 * @returns {Promise<any>} A promise that resolves with the response data or rejects with an error.
 */
async function callMsGraph(accessToken: string) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append('Authorization', bearer);

  const options = {
    method: 'GET',
    headers: headers,
  };

  return fetch(graphConfig.graphMeEndpoint, options)
    .then((response) => response.json())
    .catch((error) => {
      throw error;
    });
}

export { msalInstance };

export { msalPlugin };
