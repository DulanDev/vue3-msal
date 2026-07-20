import { PublicClientApplication } from '@azure/msal-browser';
import type { Configuration } from '@azure/msal-browser';

/**
 * Creates and returns a new PublicClientApplication instance with the provided configuration.
 *
 * @param msalConfig - The configuration for the MSAL PublicClientApplication.
 * @returns A new PublicClientApplication instance.
 */
export const msalInstance = (msalConfig: Configuration) => {
  return new PublicClientApplication(msalConfig);
};
