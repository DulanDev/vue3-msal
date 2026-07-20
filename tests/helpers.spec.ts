import { describe, it, expect } from 'vitest';
import { accountArraysAreEqual } from '../src/helpers';

const a = (overrides: Partial<any> = {}) => ({
  homeAccountId: 'h1',
  localAccountId: 'l1',
  username: 'u@example.com',
  ...overrides,
});

describe('accountArraysAreEqual() — regression (v1.0.6 behavior)', () => {
  it('returns true for two empty arrays', () => {
    expect(accountArraysAreEqual([], [])).toBe(true);
  });

  it('returns true when both arrays contain the same accounts in the same order', () => {
    const x = [a(), a({ homeAccountId: 'h2', username: 'b@example.com' })];
    expect(accountArraysAreEqual(x, x)).toBe(true);
  });

  it('returns false for different lengths', () => {
    expect(accountArraysAreEqual([a()], [])).toBe(false);
    expect(accountArraysAreEqual([], [a()])).toBe(false);
  });

  it('returns false when accounts differ by identifier', () => {
    const x = [a()];
    const y = [a({ homeAccountId: 'h2' })];
    expect(accountArraysAreEqual(x, y)).toBe(false);
  });

  it('returns false when usernames differ', () => {
    const x = [a()];
    const y = [a({ username: 'other@example.com' })];
    expect(accountArraysAreEqual(x, y)).toBe(false);
  });

  it('order-sensitive: same accounts in different positions returns false (matches v1.0.6)', () => {
    const first = a();
    const second = a({ homeAccountId: 'h2', username: 'b@example.com' });
    expect(accountArraysAreEqual([first, second], [second, first])).toBe(false);
  });
});
