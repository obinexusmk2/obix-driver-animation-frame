/**
 * Adaptive Frame Scheduler
 * Intelligent scheduling that syncs with display refresh rate and dynamically adjusts FPS.
 */
export function createScheduler(environment, config) {
    let targetFPS = Math.max(1, config.targetFPS ?? 60);
    let detectedRefreshRate = 60;
    let lastFrameTimestamp = 0;
    let idCounter = 0;
    let loopId = null;
    let loopTick = null;
    const pending = new Map();
    // Detect refresh rate by measuring consecutive rAF deltas
    if (config.adaptToRefreshRate && environment.isBrowser && environment.hasRAF) {
        const samples = [];
        let prevTimestamp = 0;
        let sampleCount = 0;
        const measure = (timestamp) => {
            if (prevTimestamp > 0) {
                samples.push(timestamp - prevTimestamp);
            }
            prevTimestamp = timestamp;
            sampleCount++;
            if (sampleCount < 12) {
                environment.requestFrame(measure);
            }
            else {
                // Use median of middle samples for stability
                const sorted = samples.slice(1).sort((a, b) => a - b);
                if (sorted.length > 0) {
                    const median = sorted[Math.floor(sorted.length / 2)];
                    if (median > 0) {
                        detectedRefreshRate = Math.round(1000 / median);
                        targetFPS = detectedRefreshRate;
                    }
                }
            }
        };
        environment.requestFrame(measure);
    }
    function step(timestamp) {
        const minFrameTime = 1000 / targetFPS;
        if (lastFrameTimestamp > 0 && timestamp - lastFrameTimestamp < minFrameTime * 0.8) {
            // Too early — re-request without processing
            if (loopTick) {
                loopId = environment.requestFrame(step);
            }
            return;
        }
        lastFrameTimestamp = timestamp;
        // Execute one-shot pending callbacks
        if (pending.size > 0) {
            const callbacks = Array.from(pending.entries());
            pending.clear();
            for (const [, cb] of callbacks) {
                cb(timestamp);
            }
        }
        // Execute loop tick
        if (loopTick) {
            loopTick(timestamp);
            loopId = environment.requestFrame(step);
        }
    }
    return {
        request(callback) {
            const id = ++idCounter;
            pending.set(id, callback);
            // Ensure a frame is scheduled if no loop is running
            if (loopId === null) {
                loopId = environment.requestFrame((ts) => {
                    loopId = null;
                    step(ts);
                });
            }
            return id;
        },
        cancel(id) {
            pending.delete(id);
        },
        startLoop(tick) {
            loopTick = tick;
            if (loopId === null) {
                loopId = environment.requestFrame(step);
            }
        },
        stopLoop() {
            loopTick = null;
            if (loopId !== null) {
                environment.cancelFrame(loopId);
                loopId = null;
            }
        },
        setTargetFPS(fps) {
            targetFPS = Math.max(1, fps);
        },
        getDetectedRefreshRate() {
            return detectedRefreshRate;
        },
        destroy() {
            this.stopLoop();
            pending.clear();
            lastFrameTimestamp = 0;
        },
    };
}
//# sourceMappingURL=scheduler.js.map