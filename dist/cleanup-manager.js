/**
 * Automatic Cleanup & Reference Management
 * WeakRef-based GC, AbortSignal cancellation, and FinalizationRegistry cleanup.
 */
export function createCleanupManager() {
    const entries = new Set();
    const abortCleanups = new Map();
    const registry = typeof FinalizationRegistry !== 'undefined'
        ? new FinalizationRegistry((cleanup) => {
            cleanup();
        })
        : null;
    return {
        track(target, cleanup) {
            const entry = {
                ref: new WeakRef(target),
                cleanup,
            };
            entries.add(entry);
            if (registry) {
                registry.register(target, cleanup, entry);
            }
        },
        trackAbortSignal(signal, cleanup) {
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
        collectGarbage() {
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
        get trackedCount() {
            return entries.size + abortCleanups.size;
        },
        destroy() {
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
//# sourceMappingURL=cleanup-manager.js.map