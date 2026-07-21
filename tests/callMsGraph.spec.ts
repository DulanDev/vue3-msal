import { describe, it, expect, vi, afterEach } from 'vitest';
import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';

import { msalPlugin } from '../src/vue3-msal-plugin';
import { msalInstance } from '../src/msal-config';
import { useMsal } from '../src/index';

function makeInstance() {
  const instance: any = msalInstance({});
  instance.getAllAccounts.mockReturnValue([]);
  return instance;
}

const GRAPH_ME = 'https://graph.microsoft.com/v1.0/me';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('callMsGraph() — regression (v1.0.6 behavior)', () => {
  it('issues a GET request to /me with a Bearer token', async () => {
    const fetchMock = vi.fn(async (_url: string, options: any) => {
      expect(options.method).toBe('GET');
      expect(options.headers.get('Authorization')).toBe('Bearer abc123');
      return { ok: true, status: 200, json: async () => ({ displayName: 'Jane' }) } as any;
    });
    vi.stubGlobal('fetch', fetchMock);

    const instance = makeInstance();
    let ctx: any = null;
    const Test = defineComponent({
      setup() {
        ctx = useMsal();
        return {};
      },
      template: '<div></div>',
    });
    mount(Test, { global: { plugins: [[msalPlugin, instance]] } });
    await flushPromises();

    const data = await ctx.callMsGraph('abc123');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(GRAPH_ME);
    expect(data).toEqual({ displayName: 'Jane' });
  });

  it('rethrows when fetch fails (after logging the error)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );

    const instance = makeInstance();
    let ctx: any = null;
    const Test = defineComponent({
      setup() {
        ctx = useMsal();
        return {};
      },
      template: '<div></div>',
    });
    mount(Test, { global: { plugins: [[msalPlugin, instance]] } });
    await flushPromises();

    await expect(ctx.callMsGraph('abc123')).rejects.toThrow('network down');
  });

  it('returns parsed JSON on a successful response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ json: async () => ({ ok: true }) }) as any),
    );
    const instance = makeInstance();
    let ctx: any = null;
    const Test = defineComponent({
      setup() {
        ctx = useMsal();
        return {};
      },
      template: '<div></div>',
    });
    mount(Test, { global: { plugins: [[msalPlugin, instance]] } });
    await flushPromises();

    await expect(ctx.callMsGraph('t')).resolves.toEqual({ ok: true });
  });
});
