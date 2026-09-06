import { getEasing } from './easings.js';
export function createTimelineEngine(environment) {
    let idCounter = 0;
    let globalPaused = false;
    const timelines = new Map();
    function resolveEasing(easing) {
        if (!easing)
            return (t) => t;
        if (typeof easing === 'function')
            return easing;
        return getEasing(easing);
    }
    function computeProgress(tl, elapsed) {
        const { duration, iterations = 1, direction = 'normal' } = tl.config;
        if (duration <= 0)
            return { progress: 1, done: true, iteration: 0 };
        const totalDuration = duration * iterations;
        const clampedElapsed = Math.min(elapsed, isFinite(totalDuration) ? totalDuration : elapsed);
        const iteration = Math.floor(clampedElapsed / duration);
        const done = isFinite(iterations) && clampedElapsed >= totalDuration;
        let linear = done ? 1 : (clampedElapsed % duration) / duration;
        let shouldReverse = false;
        if (direction === 'reverse') {
            shouldReverse = true;
        }
        else if (direction === 'alternate') {
            shouldReverse = iteration % 2 === 1;
        }
        else if (direction === 'alternate-reverse') {
            shouldReverse = iteration % 2 === 0;
        }
        if (shouldReverse) {
            linear = 1 - linear;
        }
        return { progress: linear, done, iteration };
    }
    function createHandle(tl) {
        return {
            get id() { return tl.id; },
            get state() { return tl.state; },
            get progress() { return tl.progress; },
            get currentTime() { return tl.currentTime; },
            get iterationCount() { return tl.iterationCount; },
            play() {
                if (tl.state === 'idle') {
                    tl.state = 'running';
                    tl.startTime = environment.now() - (tl.config.delay ?? 0) * -1;
                    tl.startTime = environment.now();
                    tl.pauseOffset = 0;
                }
                else if (tl.state === 'paused') {
                    tl.state = 'running';
                    tl.pauseOffset += environment.now() - tl.pauseTime;
                }
            },
            pause() {
                if (tl.state === 'running') {
                    tl.state = 'paused';
                    tl.pauseTime = environment.now();
                }
            },
            cancel() {
                tl.state = 'finished';
                timelines.delete(tl.id);
            },
        };
    }
    return {
        create(config) {
            const id = ++idCounter;
            const tl = {
                id,
                config,
                easing: resolveEasing(config.easing),
                state: 'idle',
                startTime: 0,
                pauseTime: 0,
                pauseOffset: 0,
                progress: 0,
                currentTime: 0,
                iterationCount: 0,
                onFrameCallback: config.onFrame ?? null,
                onFinishCallback: config.onFinish ?? null,
            };
            timelines.set(id, tl);
            const handle = createHandle(tl);
            const delay = config.delay ?? 0;
            if (delay > 0) {
                globalThis.setTimeout(() => {
                    if (tl.state === 'idle')
                        handle.play();
                }, delay);
            }
            else {
                handle.play();
            }
            return handle;
        },
        tick(timestamp) {
            if (globalPaused)
                return;
            for (const [id, tl] of timelines) {
                if (tl.state !== 'running')
                    continue;
                const rawElapsed = timestamp - tl.startTime - tl.pauseOffset;
                const maxDelta = (1000 / 30) * 2;
                const prevTime = tl.currentTime;
                const delta = rawElapsed - prevTime;
                const clampedDelta = Math.min(delta, maxDelta);
                const elapsed = prevTime + clampedDelta;
                tl.currentTime = elapsed;
                const result = computeProgress(tl, elapsed);
                const easedProgress = tl.easing(result.progress);
                tl.progress = easedProgress;
                tl.iterationCount = result.iteration;
                if (tl.onFrameCallback) {
                    tl.onFrameCallback(easedProgress, clampedDelta);
                }
                if (result.done) {
                    tl.state = 'finished';
                    if (tl.onFinishCallback) {
                        tl.onFinishCallback();
                    }
                    timelines.delete(id);
                }
            }
        },
        getActiveCount() {
            let count = 0;
            for (const tl of timelines.values()) {
                if (tl.state === 'running' || tl.state === 'paused')
                    count++;
            }
            return count;
        },
        pauseAll() {
            globalPaused = true;
            for (const tl of timelines.values()) {
                if (tl.state === 'running') {
                    tl.state = 'paused';
                    tl.pauseTime = environment.now();
                }
            }
        },
        resumeAll() {
            globalPaused = false;
            const now = environment.now();
            for (const tl of timelines.values()) {
                if (tl.state === 'paused') {
                    tl.state = 'running';
                    tl.pauseOffset += now - tl.pauseTime;
                }
            }
        },
        destroy() {
            timelines.clear();
            globalPaused = false;
        },
    };
}
//# sourceMappingURL=timeline-engine.js.map