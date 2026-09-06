export function createPlaybackController(environment, timelineEngine, scheduler) {
    let state = 'idle';
    let speed = 1;
    let reversed = false;
    let currentTime = 0;
    let lastTickTimestamp = 0;
    function tick(timestamp) {
        if (state !== 'playing')
            return;
        if (lastTickTimestamp > 0) {
            const rawDelta = timestamp - lastTickTimestamp;
            const adjustedDelta = rawDelta * speed * (reversed ? -1 : 1);
            currentTime += adjustedDelta;
            if (currentTime < 0)
                currentTime = 0;
        }
        lastTickTimestamp = timestamp;
        timelineEngine.tick(currentTime);
    }
    return {
        play() {
            if (state === 'playing')
                return;
            state = 'playing';
            lastTickTimestamp = 0;
            scheduler.startLoop(tick);
        },
        pause() {
            if (state !== 'playing')
                return;
            state = 'paused';
            scheduler.stopLoop();
            timelineEngine.pauseAll();
        },
        resume() {
            if (state !== 'paused')
                return;
            state = 'playing';
            lastTickTimestamp = 0;
            timelineEngine.resumeAll();
            scheduler.startLoop(tick);
        },
        seek(timeMs) {
            currentTime = Math.max(0, timeMs);
            const frameInterval = 1000 / 60;
            currentTime = Math.round(currentTime / frameInterval) * frameInterval;
            timelineEngine.tick(currentTime);
        },
        reverse() {
            reversed = !reversed;
        },
        setSpeed(multiplier) {
            speed = Math.max(0.01, multiplier);
        },
        get state() { return state; },
        get speed() { return speed; },
        get reversed() { return reversed; },
        get currentTime() { return currentTime; },
        destroy() {
            scheduler.stopLoop();
            state = 'idle';
            speed = 1;
            reversed = false;
            currentTime = 0;
            lastTickTimestamp = 0;
        },
    };
}
//# sourceMappingURL=playback-controller.js.map