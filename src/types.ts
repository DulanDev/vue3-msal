import type { InteractionStatus, PublicClientApplication } from '@azure/msal-browser';
import type {
  AccountInfo,
  AuthenticationResult,
  AuthError,
  PopupRequest,
  RedirectRequest,
  SilentRequest,
} from '@azure/msal-browser';
import type { Ref } from 'vue';

export type AccountIdentifiers = Partial<Pick<AccountInfo, 'homeAccountId' | 'localAccountId' | 'username'>>;

export type State = {
  instance: PublicClientApplication;
  inProgress: InteractionStatus;
  accounts: AccountInfo[];
};

export type MsalContext = {
  instance: PublicClientApplication;
  accounts: Ref<AccountInfo[]>;
  inProgress: Ref<InteractionStatus>;
  loginRequest: {
    scopes: string[];
  };
  callMsGraph: (accessToken: string) => Promise<any>;
};

export type MsalAuthenticationResult = {
  acquireToken: (requestOverride?: PopupRequest | RedirectRequest | SilentRequest) => Promise<void>;
  result: Ref<AuthenticationResult | null>;
  error: Ref<AuthError | null>;
  inProgress: Ref<boolean>;
};

export type MsalPluginOptions = {
  graphEndpoint?: string;
  defaultLoginScopes?: string[];
};

declare module 'vue' {
  interface ComponentCustomProperties {
    $msal: State;
  }
}
