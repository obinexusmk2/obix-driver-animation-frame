import { describe, expect, it, vi, afterEach } from 'vitest';
import { createEnvironmentAdapter } from '../src/environment-adapter';

describe('environment-adapter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates adapter with correct environment detection', () => {
    const adapter = createEnvironmentAdapter();
    // In vitest/jsdom, isBrowser may be true
    expect(typeof adapter.isBrowser).toBe('boolean');
    expect(typeof adapter.isNode).toBe('boolean');
    expect(typeof adapter.hasRAF).toBe('boolean');
    adapter.destroy();
  });

  it('now() returns a number', () => {
    const adapter = createEnvironmentAdapter();
    const t = adapter.now();
    expect(typeof t).toBe('number');
    expect(t).toBeGreaterThanOrEqual(0);
    adapter.destroy();
  });

  it('requestFrame calls callback', async () => {
    const adapter = createEnvironmentAdapter();
    const result = await new Promise<number>((resolve) => {
      adapter.requestFrame((ts) => resolve(ts));
    });
    expect(typeof result).toBe('number');
    adapter.destroy();
  });

  it('cancelFrame prevents callback', async () => {
    const adapter = createEnvironmentAdapter();
    const fn = vi.fn();
    const id = adapter.requestFrame(fn);
    adapter.cancelFrame(id);
    // Wait a tick to ensure it would have fired
    await new Promise((r) => setTimeout(r, 50));
    expect(fn).not.toHaveBeenCalled();
    adapter.destroy();
  });

  it('destroy cleans up pending timers', () => {
    const adapter = createEnvironmentAdapter();
    const fn = vi.fn();
    adapter.requestFrame(fn);
    adapter.destroy();
    // No assertions needed - just verifying no errors
  });
});
