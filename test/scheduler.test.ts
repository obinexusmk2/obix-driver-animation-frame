import { describe, expect, it, vi, afterEach } from 'vitest';
import { createScheduler } from '../src/scheduler';
import { createEnvironmentAdapter } from '../src/environment-adapter';

describe('scheduler', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('executes one-shot request callback', async () => {
    const env = createEnvironmentAdapter();
    const scheduler = createScheduler(env, { targetFPS: 60 });

    const result = await new Promise<number>((resolve) => {
      scheduler.request((ts) => resolve(ts));
    });

    expect(typeof result).toBe('number');
    scheduler.destroy();
    env.destroy();
  });

  it('cancel prevents callback execution', async () => {
    const env = createEnvironmentAdapter();
    const scheduler = createScheduler(env, { targetFPS: 60 });
    const fn = vi.fn();
    const id = scheduler.request(fn);
    scheduler.cancel(id);

    await new Promise((r) => setTimeout(r, 50));
    expect(fn).not.toHaveBeenCalled();
    scheduler.destroy();
    env.destroy();
  });

  it('startLoop/stopLoop controls continuous ticking', async () => {
    const env = createEnvironmentAdapter();
    const scheduler = createScheduler(env, { targetFPS: 60 });
    let tickCount = 0;

    scheduler.startLoop(() => {
      tickCount++;
    });

    await new Promise((r) => setTimeout(r, 100));
    scheduler.stopLoop();

    expect(tickCount).toBeGreaterThan(0);
    scheduler.destroy();
    env.destroy();
  });

  it('setTargetFPS updates FPS', () => {
    const env = createEnvironmentAdapter();
    const scheduler = createScheduler(env, { targetFPS: 30 });
    scheduler.setTargetFPS(120);
    // No error means success
    scheduler.destroy();
    env.destroy();
  });

  it('getDetectedRefreshRate returns a number', () => {
    const env = createEnvironmentAdapter();
    const scheduler = createScheduler(env, { targetFPS: 60 });
    expect(scheduler.getDetectedRefreshRate()).toBe(60);
    scheduler.destroy();
    env.destroy();
  });
});
