/**
 * Universal Environment Adapter
 * Isomorphic rAF/performance.now polyfills for browser, Node.js, and SSR.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
const _global = globalThis;
export function createEnvironmentAdapter() {
    const isBrowser = typeof _global.window !== 'undefined' &&
        typeof _global.document !== 'undefined';
    const isNode = typeof _global.process !== 'undefined' &&
        typeof _global.process.versions?.node === 'string';
    const hasRAF = typeof _global.requestAnimationFrame === 'function';
    // Monotonic time source
    const now = typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? () => performance.now()
        : () => Date.now();
    // Frame request/cancel
    let idCounter = 0;
    const timers = new Map();
    const requestFrame = hasRAF
        ? (cb) => _global.requestAnimationFrame(cb)
        : (cb) => {
            const id = ++idCounter;
            const useImmediate = typeof _global.setImmediate === 'function';
            const timer = useImmediate
                ? _global.setImmediate(() => {
                    timers.delete(id);
                    cb(now());
                })
                : setTimeout(() => {
                    timers.delete(id);
                    cb(now());
                }, 0);
            timers.set(id, timer);
            return id;
        };
    const cancelFrame = hasRAF
        ? (id) => _global.cancelAnimationFrame(id)
        : (id) => {
            const timer = timers.get(id);
            if (timer !== undefined) {
                if (typeof _global.clearImmediate === 'function') {
                    _global.clearImmediate(timer);
                }
                else {
                    clearTimeout(timer);
                }
                timers.delete(id);
            }
        };
    return {
        get isBrowser() { return isBrowser; },
        get isNode() { return isNode; },
        get hasRAF() { return hasRAF; },
        requestFrame,
        cancelFrame,
        now,
        destroy() {
            for (const [id] of timers) {
                cancelFrame(id);
            }
            timers.clear();
        },
    };
}
//# sourceMappingURL=environment-adapter.js.map