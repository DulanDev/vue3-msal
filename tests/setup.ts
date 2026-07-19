import { vi } from 'vitest'

function defaults() {
  return {
    _eventCallback: null as ((message: any) => void) | null,
    getAllAccounts: vi.fn(() => [] as any[]),
    addEventCallback: vi.fn(function (this: any, cb: (message: any) => void) {
      this._eventCallback = cb
    }),
    emitEvent(this: any, message: any) {
      if (this._eventCallback) this._eventCallback(message)
    },
    handleRedirectPromise: vi.fn(() => Promise.resolve(null)),
    initialize: vi.fn(() => Promise.resolve()),
    acquireTokenSilent: vi.fn(() => Promise.reject(new Error('silent failed'))),
    loginPopup: vi.fn(() =>
      Promise.resolve({
        accessToken: 'popup-token',
        account: { homeAccountId: 'h1', localAccountId: 'l1', username: 'u@example.com' },
      }),
    ),
    loginRedirect: vi.fn(() => Promise.resolve()),
    setActiveAccount: vi.fn(),
    getActiveAccount: vi.fn(() => null),
  }
}

vi.mock('@azure/msal-browser', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    PublicClientApplication: class {
      constructor() {
        Object.assign(this, defaults())
      }
    },
  }
})

export function resetMsalMockMethods(instance: any) {
  Object.assign(instance, defaults())
}