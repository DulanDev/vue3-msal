import { describe, it, expect, vi } from 'vitest';
import { defineComponent, toRaw } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { BrowserAuthError, BrowserAuthErrorCodes, EventType, InteractionStatus } from '@azure/msal-browser';

import { msalPlugin } from '../src/vue3-msal-plugin';
import { msalInstance } from '../src/msal-config';

function makeInstance(over: Partial<any> = {}) {
  const instance: any = msalInstance({});
  instance.getAllAccounts.mockReturnValue([]);
  Object.assign(instance, over);
  return instance;
}

describe('msalPlugin.install — regression (v1.0.6 behavior)', () => {
  it('attaches a reactive $msal with instance, accounts, and inProgress on globalProperties', async () => {
    const instance = makeInstance();
    const Test = defineComponent({ setup: () => ({}), template: '<div></div>' });
    const wrapper = mount(Test, { global: { plugins: [[msalPlugin, instance]] } });
    await flushPromises();

    expect(wrapper.vm.$msal).toBeDefined();
    expect(toRaw(wrapper.vm.$msal.instance)).toBe(toRaw(instance));
    expect(Array.isArray(wrapper.vm.$msal.accounts)).toBe(true);
    expect(wrapper.vm.$msal.inProgress).toBe(InteractionStatus.Startup);
  });

  it('updates accounts when an ACCOUNT_ADDED event fires', async () => {
    const instance = makeInstance();
    const Test = defineComponent({ setup: () => ({}), template: '<div></div>' });
    const wrapper = mount(Test, { global: { plugins: [[msalPlugin, instance]] } });
    await flushPromises();

    const account = { homeAccountId: 'h1', localAccountId: 'l1', username: 'u@example.com' };
    instance.getAllAccounts.mockReturnValue([account]);
    instance.emitEvent({ eventType: EventType.ACCOUNT_ADDED, payload: account });

    expect(wrapper.vm.$msal.accounts).toHaveLength(1);
    expect(wrapper.vm.$msal.accounts[0].username).toBe('u@example.com');
  });

  it('updates accounts on LOGIN_SUCCESS', async () => {
    const instance = makeInstance();
    const Test = defineComponent({ setup: () => ({}), template: '<div></div>' });
    const wrapper = mount(Test, { global: { plugins: [[msalPlugin, instance]] } });
    await flushPromises();

    const account = { homeAccountId: 'h2', localAccountId: 'l2', username: 'other@example.com' };
    instance.getAllAccounts.mockReturnValue([account]);
    instance.emitEvent({ eventType: EventType.LOGIN_SUCCESS, payload: { account } });

    expect(wrapper.vm.$msal.accounts).toHaveLength(1);
    expect(wrapper.vm.$msal.accounts[0].username).toBe('other@example.com');
  });

  it('does not re-assign accounts when they are identical', async () => {
    const instance = makeInstance({
      getAllAccounts: () => [],
    });
    instance.getAllAccounts = vi.fn(() => []);
    const Test = defineComponent({ setup: () => ({}), template: '<div></div>' });
    const wrapper = mount(Test, { global: { plugins: [[msalPlugin, instance]] } });
    await flushPromises();
    const before = wrapper.vm.$msal.accounts;
    instance.emitEvent({ eventType: EventType.LOGIN_FAILURE, payload: null });
    expect(wrapper.vm.$msal.accounts).toBe(before);
  });

  it('registers an event callback via msalInstance.addEventCallback', async () => {
    const instance = makeInstance();
    const Test = defineComponent({ setup: () => ({}), template: '<div></div>' });
    mount(Test, { global: { plugins: [[msalPlugin, instance]] } });
    await flushPromises();
    expect(instance.addEventCallback).toHaveBeenCalledTimes(1);
    expect(typeof instance._eventCallback).toBe('function');
  });
});

describe('msalPlugin.install — before initialize() resolves', () => {
  const uninitialized = () =>
    new BrowserAuthError(BrowserAuthErrorCodes.uninitializedPublicClientApplication);

  it('does not throw and starts with an empty account list', async () => {
    const instance = makeInstance();
    instance.getAllAccounts.mockImplementation(() => {
      throw uninitialized();
    });
    instance.initialize = vi.fn(() => new Promise(() => {}));
    const Test = defineComponent({ setup: () => ({}), template: '<div></div>' });

    const wrapper = mount(Test, { global: { plugins: [[msalPlugin, instance]] } });
    await flushPromises();

    expect(wrapper.vm.$msal.accounts).toEqual([]);
  });

  it('syncs the cached accounts once initialize() resolves', async () => {
    const instance = makeInstance();
    const account = { homeAccountId: 'h1', localAccountId: 'l1', username: 'u@example.com' };
    let initialized = false;
    instance.getAllAccounts.mockImplementation(() => {
      if (!initialized) throw uninitialized();
      return [account];
    });
    instance.initialize = vi.fn(() => {
      initialized = true;
      return Promise.resolve();
    });
    const Test = defineComponent({ setup: () => ({}), template: '<div></div>' });

    const wrapper = mount(Test, { global: { plugins: [[msalPlugin, instance]] } });
    await flushPromises();

    expect(instance.initialize).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.$msal.accounts).toHaveLength(1);
    expect(wrapper.vm.$msal.accounts[0].username).toBe('u@example.com');
  });

  it('does not call initialize() when the accounts were readable at install', async () => {
    const instance = makeInstance();
    const Test = defineComponent({ setup: () => ({}), template: '<div></div>' });
    mount(Test, { global: { plugins: [[msalPlugin, instance]] } });
    await flushPromises();

    expect(instance.initialize).not.toHaveBeenCalled();
  });

  it('rethrows errors other than uninitialized_public_client_application', () => {
    const instance = makeInstance();
    instance.getAllAccounts.mockImplementation(() => {
      throw new Error('boom');
    });
    const Test = defineComponent({ setup: () => ({}), template: '<div></div>' });

    expect(() => mount(Test, { global: { plugins: [[msalPlugin, instance]] } })).toThrow('boom');
  });
});
