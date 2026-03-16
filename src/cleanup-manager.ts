/**
 * Automatic Cleanup & Reference Management
 * WeakRef-based GC, AbortSignal cancellation, and FinalizationRegistry cleanup.
 */

import type { CleanupManagerAPI } from './types.js';

interface TrackedEntry {
  ref: WeakRef<object>;
  cleanup: () => void;
}

export function createCleanupManager(): CleanupManagerAPI {
  const entries = new Set<TrackedEntry>();
  const abortCleanups = new Map<AbortSignal, () => void>();

  const registry = typeof FinalizationRegistry !== 'undefined'
    ? new FinalizationRegistry<() => void>((cleanup) => {
        cleanup();
      })
    : null;

  return {
    track(target: object, cleanup: () => void): void {
      const entry: TrackedEntry = {
        ref: new WeakRef(target),
        cleanup,
      };
      entries.add(entry);

      if (registry) {
        registry.register(target, cleanup, entry);
      }
    },

    trackAbortSignal(signal: AbortSignal, cleanup: () => void): void {
      if (signal.aborted) {
        cleanup();
        return;
      }
      const handler = () => {
        cleanup();
        abortCleanups.delete(signal);
      };
      signal.addEventListener('abort', handler, { once: true });
      abortCleanups.set(signal, handler);
    },

    collectGarbage(): number {
      let collected = 0;
      for (const entry of entries) {
        if (entry.ref.deref() === undefined) {
          entry.cleanup();
          if (registry) {
            registry.unregister(entry);
          }
          entries.delete(entry);
          collected++;
        }
      }
      return collected;
    },

    get trackedCount(): number {
      return entries.size + abortCleanups.size;
    },

    destroy(): void {
      for (const entry of entries) {
        if (registry) {
          registry.unregister(entry);
        }
      }
      entries.clear();
      abortCleanups.clear();
    },
  };
}
