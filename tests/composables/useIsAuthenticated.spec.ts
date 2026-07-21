import { describe, it, expect } from 'vitest';
import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';

import { msalPlugin } from '../../src/vue3-msal-plugin';
import { msalInstance } from '../../src/msal-config';
import { useIsAuthenticated } from '../../src/index';

function makeInstance() {
  const instance: any = msalInstance({});
  instance.getAllAccounts.mockReturnValue([]);
  return instance;
}

describe('useIsAuthenticated() — regression (v1.0.6 behavior)', () => {
  it('returns false when there are no accounts', async () => {
    const instance = makeInstance();
    let authed: any = null;
    const Test = defineComponent({
      setup() {
        authed = useIsAuthenticated();
        return {};
      },
      template: '<div></div>',
    });
    mount(Test, { global: { plugins: [[msalPlugin, instance]] } });
    await flushPromises();

    expect(authed.value).toBe(false);
  });

  it('returns true when accounts are present', async () => {
    const instance = makeInstance();
    instance.getAllAccounts.mockReturnValue([{ homeAccountId: 'h1', localAccountId: 'l1', username: 'u@example.com' }]);
    let authed: any = null;
    const Test = defineComponent({
      setup() {
        authed = useIsAuthenticated();
        return {};
      },
      template: '<div></div>',
    });
    mount(Test, { global: { plugins: [[msalPlugin, instance]] } });
    await flushPromises();

    expect(authed.value).toBe(true);
  });

  it('reactively updates when the MSAL instance reports new accounts', async () => {
    const instance = makeInstance();
    instance.getAllAccounts.mockReturnValue([]);
    let authed: any = null;
    const Test = defineComponent({
      setup() {
        authed = useIsAuthenticated();
        return { authed };
      },
      template: '<div></div>',
    });
    const wrapper = mount(Test, { global: { plugins: [[msalPlugin, instance]] } });
    await flushPromises();
    expect(authed.value).toBe(false);

    instance.getAllAccounts.mockReturnValue([{ homeAccountId: 'h1', localAccountId: 'l1', username: 'u@example.com' }]);
    wrapper.vm.$msal.accounts = instance.getAllAccounts();
    await flushPromises();

    expect(authed.value).toBe(true);
  });
});
