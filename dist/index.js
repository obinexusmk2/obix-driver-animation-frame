export { createEnvironmentAdapter } from './environment-adapter.js';
export { easings, getEasing, createCubicBezier } from './easings.js';
export { createScheduler } from './scheduler.js';
export { createTimelineEngine } from './timeline-engine.js';
export { createVisibilityController } from './visibility-controller.js';
export { createAnimationGraph } from './animation-graph.js';
export { createPlaybackController } from './playback-controller.js';
export { createCleanupManager } from './cleanup-manager.js';
export { createPerformanceMonitor } from './performance-monitor.js';
import { createEnvironmentAdapter } from './environment-adapter.js';
import { getEasing, createCubicBezier } from './easings.js';
import { createScheduler } from './scheduler.js';
import { createTimelineEngine } from './timeline-engine.js';
import { createVisibilityController } from './visibility-controller.js';
import { createAnimationGraph } from './animation-graph.js';
import { createPlaybackController } from './playback-controller.js';
import { createCleanupManager } from './cleanup-manager.js';
import { createPerformanceMonitor } from './performance-monitor.js';
export function createAnimationFrameDriver(config = {}) {
    const targetFPS = Math.max(1, config.targetFPS ?? 60);
    const environment = createEnvironmentAdapter();
    const scheduler = createScheduler(environment, {
        targetFPS,
        adaptToRefreshRate: config.adaptToRefreshRate ?? config.autoThrottle ?? false,
    });
    const visibilityController = createVisibilityController(environment, config.visibility);
    const timelineEngine = createTimelineEngine(environment);
    const animationGraph = createAnimationGraph(timelineEngine);
    const playbackController = createPlaybackController(environment, timelineEngine, scheduler);
    const cleanupManager = createCleanupManager();
    const performanceMonitor = config.enableMetrics !== false
        ? createPerformanceMonitor(environment)
        : null;
    let initializedAt = 0;
    let frameCount = 0;
    let paused = false;
    let idCounter = 0;
    const pendingCallbacks = new Map();
    visibilityController.onVisibilityChange((visible) => {
        if (visible) {
            if (paused)
                driver.resume();
        }
        else {
            const effectiveFPS = visibilityController.getEffectiveTargetFPS(targetFPS);
            if (effectiveFPS === 0) {
                driver.pause();
            }
            else {
                scheduler.setTargetFPS(effectiveFPS);
            }
        }
    });
    function mainTick(timestamp) {
        if (paused)
            return;
        performanceMonitor?.beginFrame();
        frameCount++;
        timelineEngine.tick(timestamp);
        animationGraph.tick(timestamp);
        if (pendingCallbacks.size > 0) {
            const callbacks = Array.from(pendingCallbacks.entries());
            pendingCallbacks.clear();
            for (const [, cb] of callbacks) {
                cb(timestamp);
            }
        }
        performanceMonitor?.endFrame();
    }
    const driver = {
        async initialize() {
            initializedAt = Date.now();
            frameCount = 0;
            paused = false;
            scheduler.startLoop(mainTick);
        },
        async destroy() {
            driver.pause();
            scheduler.destroy();
            timelineEngine.destroy();
            animationGraph.destroy();
            playbackController.destroy();
            visibilityController.destroy();
            cleanupManager.destroy();
            performanceMonitor?.destroy();
            environment.destroy();
            pendingCallbacks.clear();
            initializedAt = 0;
            frameCount = 0;
        },
        scheduleFrame(callback) {
            const id = ++idCounter;
            pendingCallbacks.set(id, callback);
            return id;
        },
        cancelFrame(id) {
            pendingCallbacks.delete(id);
        },
        setTargetFPS(fps) {
            scheduler.setTargetFPS(Math.max(1, fps));
        },
        getFrameCount() {
            return frameCount;
        },
        getElapsedTime() {
            return initializedAt === 0 ? 0 : Date.now() - initializedAt;
        },
        pause() {
            paused = true;
            scheduler.stopLoop();
            timelineEngine.pauseAll();
        },
        resume() {
            paused = false;
            const effectiveFPS = visibilityController.getEffectiveTargetFPS(targetFPS);
            if (effectiveFPS > 0) {
                scheduler.setTargetFPS(effectiveFPS);
            }
            timelineEngine.resumeAll();
            scheduler.startLoop(mainTick);
        },
        play() {
            playbackController.play();
        },
        seek(timeMs) {
            playbackController.seek(timeMs);
        },
        reverse() {
            playbackController.reverse();
        },
        setSpeed(multiplier) {
            playbackController.setSpeed(multiplier);
        },
        createTimeline(config) {
            return timelineEngine.create(config);
        },
        buildAnimationGraph(root) {
            return animationGraph.build(root);
        },
        getEasing(name) {
            return getEasing(name);
        },
        createCubicBezier(x1, y1, x2, y2) {
            return createCubicBezier(x1, y1, x2, y2);
        },
        trackCleanup(target, cleanup) {
            cleanupManager.track(target, cleanup);
        },
        getMetrics() {
            if (!performanceMonitor) {
                return {
                    fps: 0,
                    averageFps: 0,
                    frameTime: 0,
                    averageFrameTime: 0,
                    droppedFrames: 0,
                    totalFrames: frameCount,
                    jank: 0,
                    histogram: { buckets: [], counts: [] },
                };
            }
            return performanceMonitor.getMetrics();
        },
        get scheduler() { return scheduler; },
        get timelineEngine() { return timelineEngine; },
        get visibilityController() { return visibilityController; },
        get animationGraph() { return animationGraph; },
        get playbackController() { return playbackController; },
        get cleanupManager() { return cleanupManager; },
        get performanceMonitor() { return performanceMonitor; },
        get environment() { return environment; },
    };
    return driver;
}
//# sourceMappingURL=index.js.map