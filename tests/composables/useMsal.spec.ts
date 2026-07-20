import { describe, it, expect } from 'vitest'
import { defineComponent, toRaw } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { InteractionStatus } from '@azure/msal-browser'

import { msalPlugin } from '../../src/vue3-msal-plugin'
import { msalInstance } from '../../src/msal-config'
import { useMsal } from '../../src/index'

function makeInstance() {
  const instance: any = msalInstance({})
  instance.getAllAccounts.mockReturnValue([])
  return instance
}

describe('useMsal() — regression (v1.0.6 behavior)', () => {
  it('exposes instance, accounts, inProgress, loginRequest, and callMsGraph', async () => {
    const instance = makeInstance()
    let captured: any = null
    const Test = defineComponent({
      setup() {
        captured = useMsal()
        return {}
      },
      template: '<div></div>',
    })
    mount(Test, { global: { plugins: [[msalPlugin, instance]] } })
    await flushPromises()

    expect(toRaw(captured.instance)).toBe(toRaw(instance))
    expect(Array.isArray(captured.accounts.value)).toBe(true)
    expect(captured.inProgress.value).toBe(InteractionStatus.Startup)
    expect(captured.loginRequest).toEqual({ scopes: ['User.Read'] })
    expect(typeof captured.callMsGraph).toBe('function')
  })

  it('reflects accounts currently known by the MSAL instance', async () => {
    const instance = makeInstance()
    const account = {
      homeAccountId: 'h1',
      localAccountId: 'l1',
      username: 'u@example.com',
    }
    instance.getAllAccounts.mockReturnValue([account])

    let captured: any = null
    const Test = defineComponent({
      setup() {
        captured = useMsal()
        return {}
      },
      template: '<div></div>',
    })
    mount(Test, { global: { plugins: [[msalPlugin, instance]] } })
    await flushPromises()

    expect(captured.accounts.value).toHaveLength(1)
    expect(captured.accounts.value[0].username).toBe('u@example.com')
  })

  it('calls initialize() then handleRedirectPromise() on Startup', async () => {
    const instance = makeInstance()
    const Test = defineComponent({
      setup() {
        useMsal()
        return {}
      },
      template: '<div></div>',
    })
    mount(Test, { global: { plugins: [[msalPlugin, instance]] } })
    await flushPromises()

    expect(instance.initialize).toHaveBeenCalledTimes(1)
    expect(instance.handleRedirectPromise).toHaveBeenCalledTimes(1)
  })

  it('throws when called outside the setup() function of a component', async () => {
    const instance = makeInstance()
    const Test = defineComponent({
      setup() {
        return {}
      },
      template: '<div></div>',
    })
    mount(Test, { global: { plugins: [[msalPlugin, instance]] } })
    await flushPromises()

    // Called outside any component setup.
    expect(() => useMsal()).toThrow(/setup\(\)/)
  })
})