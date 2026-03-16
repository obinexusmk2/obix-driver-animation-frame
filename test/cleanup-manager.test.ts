import { describe, expect, it } from 'vitest';
import { createCleanupManager } from '../src/cleanup-manager';

describe('cleanup-manager', () => {
  it('tracks objects and reports count', () => {
    const manager = createCleanupManager();
    const target = { name: 'test' };

    manager.track(target, () => {});
    expect(manager.trackedCount).toBe(1);

    manager.destroy();
  });

  it('trackAbortSignal calls cleanup on abort', () => {
    const manager = createCleanupManager();
    const controller = new AbortController();
    let cleaned = false;

    manager.trackAbortSignal(controller.signal, () => {
      cleaned = true;
    });

    controller.abort();
    expect(cleaned).toBe(true);

    manager.destroy();
  });

  it('trackAbortSignal calls cleanup immediately if already aborted', () => {
    const manager = createCleanupManager();
    const controller = new AbortController();
    controller.abort();

    let cleaned = false;
    manager.trackAbortSignal(controller.signal, () => {
      cleaned = true;
    });

    expect(cleaned).toBe(true);
    manager.destroy();
  });

  it('collectGarbage returns 0 when all refs are alive', () => {
    const manager = createCleanupManager();
    const target = { name: 'alive' };

    manager.track(target, () => {});
    const collected = manager.collectGarbage();
    expect(collected).toBe(0);

    // Keep target alive
    expect(target.name).toBe('alive');
    manager.destroy();
  });

  it('destroy cleans up without errors', () => {
    const manager = createCleanupManager();
    manager.track({}, () => {});
    manager.destroy();
    expect(manager.trackedCount).toBe(0);
  });
});
