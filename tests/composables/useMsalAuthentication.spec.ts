import { describe, it, expect, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { EventType, InteractionType } from '@azure/msal-browser';

import { msalPlugin } from '../../src/vue3-msal-plugin';
import { msalInstance } from '../../src/msal-config';
import { useMsalAuthentication } from '../../src/index';

const REQUEST = { scopes: ['User.Read'] };

function makeInstance(over: Partial<any> = {}) {
  const instance: any = msalInstance({});
  instance.getAllAccounts.mockReturnValue([]);
  Object.assign(instance, over);
  return instance;
}

// Drive inProgress from Startup → HandleRedirect → None during install so that
// useMsal() sees inProgress === None and the popup/redirect fallbacks are
// reachable on the first acquireToken call (the path that works in v1.0.6).
function makeInstanceAtNone(over: Partial<any> = {}) {
  const instance = makeInstance(over);
  instance.addEventCallback = vi.fn((cb: (m: any) => void) => {
    cb({ eventType: EventType.HANDLE_REDIRECT_START, interactionType: InteractionType.Redirect });
    cb({ eventType: EventType.HANDLE_REDIRECT_END, interactionType: InteractionType.Redirect });
  });
  return instance;
}

function withMsal(interactionType: InteractionType, instance: any) {
  let captured: any = null;
  const Test = defineComponent({
    setup() {
      captured = useMsalAuthentication(interactionType, REQUEST);
      return {};
    },
    template: '<div></div>',
  });
  const wrapper = mount(Test, { global: { plugins: [[msalPlugin, instance]] } });
  return { wrapper, getCaptured: () => captured };
}

describe('useMsalAuthentication() — regression (v1.0.6 behavior)', () => {
  it('uses the silent path and sets result on success', async () => {
    const instance = makeInstance({
      acquireTokenSilent: vi.fn(() => Promise.resolve({ accessToken: 'silent-token', account: {} })),
    });
    const { getCaptured } = withMsal(InteractionType.Silent, instance);
    await flushPromises();

    const { result, error, inProgress } = getCaptured();
    expect(result.value?.accessToken).toBe('silent-token');
    expect(error.value).toBeNull();
    expect(inProgress.value).toBe(false);
    expect(instance.acquireTokenSilent).toHaveBeenCalledWith(REQUEST);
  });

  it('falls back to loginPopup on silent failure when inProgress is None', async () => {
    const instance = makeInstanceAtNone({
      acquireTokenSilent: vi.fn(() => Promise.reject(new Error('silent failed'))),
      loginPopup: vi.fn(() => Promise.resolve({ accessToken: 'pop-token', account: {} })),
    });
    const { getCaptured } = withMsal(InteractionType.Popup, instance);
    await flushPromises();

    expect(instance.loginPopup).toHaveBeenCalledWith(REQUEST);
    const { result, error } = getCaptured();
    expect(result.value?.accessToken).toBe('pop-token');
    expect(error.value).toBeNull();
  });

  it('uses loginRedirect path for Redirect interactionType', async () => {
    const instance = makeInstanceAtNone({
      acquireTokenSilent: vi.fn(() => Promise.reject(new Error('silent failed'))),
      loginRedirect: vi.fn(() => Promise.resolve()),
    });
    const { getCaptured } = withMsal(InteractionType.Redirect, instance);
    await flushPromises();

    expect(instance.loginRedirect).toHaveBeenCalledWith(REQUEST);
    const { result } = getCaptured();
    expect(result.value).toBeNull();
  });

  it('sets error when loginPopup rejects', async () => {
    const instance = makeInstanceAtNone({
      acquireTokenSilent: vi.fn(() => Promise.reject(new Error('silent failed'))),
      loginPopup: vi.fn(() => Promise.reject(new Error('popup failed'))),
    });
    const { getCaptured } = withMsal(InteractionType.Popup, instance);
    await flushPromises();

    const { result, error } = getCaptured();
    expect(result.value).toBeNull();
    expect(error.value).toBeInstanceOf(Error);
    expect(error.value?.message).toBe('popup failed');
  });

  it('acquireToken(requestOverride) passes the override instead of the initial request', async () => {
    const instance = makeInstance({
      acquireTokenSilent: vi.fn(() => Promise.resolve({ accessToken: 'silent-token', account: {} })),
    });
    const { getCaptured } = withMsal(InteractionType.Silent, instance);
    await flushPromises();
    instance.acquireTokenSilent.mockClear();

    const override = { scopes: ['Mail.Read'] };
    await getCaptured().acquireToken(override);
    await flushPromises();

    expect(instance.acquireTokenSilent).toHaveBeenCalledWith(override);
    expect(getCaptured().result.value?.accessToken).toBe('silent-token');
  });
});
