/**
 * Animation Frame Driver
 * requestAnimationFrame scheduling, timeline orchestration, and animation management.
 */

// Re-export all types
export type {
  EasingFunction,
  EasingName,
  AnimationFrameCallback,
  EnvironmentAdapterAPI,
  SchedulerConfig,
  SchedulerAPI,
  TimelineDirection,
  TimelineFillMode,
  TimelineState,
  TimelineConfig,
  TimelineHandle,
  TimelineEngineAPI,
  VisibilityConfig,
  VisibilityControllerAPI,
  AnimationNodeType,
  AnimationNodeConfig,
  AnimationGraphState,
  AnimationGraphHandle,
  AnimationGraphAPI,
  PlaybackState,
  PlaybackControllerAPI,
  CleanupManagerAPI,
  FrameTimeHistogram,
  FrameMetrics,
  PerformanceMonitorAPI,
  LegacyTimeline,
  AnimationFrameDriverConfig,
  AnimationFrameDriverAPI,
} from './types.js';

// Re-export sub-module factories
export { createEnvironmentAdapter } from './environment-adapter.js';
export { easings, getEasing, createCubicBezier } from './easings.js';
export { createScheduler } from './scheduler.js';
export { createTimelineEngine } from './timeline-engine.js';
export { createVisibilityController } from './visibility-controller.js';
export { createAnimationGraph } from './animation-graph.js';
export { createPlaybackController } from './playback-controller.js';
export { createCleanupManager } from './cleanup-manager.js';
export { createPerformanceMonitor } from './performance-monitor.js';

// Imports for the main factory
import type {
  AnimationFrameCallback,
  AnimationFrameDriverAPI,
  AnimationFrameDriverConfig,
  AnimationNodeConfig,
  EasingName,
  FrameMetrics,
  TimelineConfig,
} from './types.js';

import { createEnvironmentAdapter } from './environment-adapter.js';
import { getEasing, createCubicBezier } from './easings.js';
import { createScheduler } from './scheduler.js';
import { createTimelineEngine } from './timeline-engine.js';
import { createVisibilityController } from './visibility-controller.js';
import { createAnimationGraph } from './animation-graph.js';
import { createPlaybackController } from './playback-controller.js';
import { createCleanupManager } from './cleanup-manager.js';
import { createPerformanceMonitor } from './performance-monitor.js';

export function createAnimationFrameDriver(
  config: AnimationFrameDriverConfig = {}
): AnimationFrameDriverAPI {
  const targetFPS = Math.max(1, config.targetFPS ?? 60);

  // Create sub-modules
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

  // Internal state
  let initializedAt = 0;
  let frameCount = 0;
  let paused = false;
  let idCounter = 0;
  const pendingCallbacks = new Map<number, AnimationFrameCallback>();

  // Wire visibility controller to auto-pause
  visibilityController.onVisibilityChange((visible) => {
    if (visible) {
      if (paused) driver.resume();
    } else {
      const effectiveFPS = visibilityController.getEffectiveTargetFPS(targetFPS);
      if (effectiveFPS === 0) {
        driver.pause();
      } else {
        scheduler.setTargetFPS(effectiveFPS);
      }
    }
  });

  // Main tick function driven by scheduler
  function mainTick(timestamp: number): void {
    if (paused) return;

    performanceMonitor?.beginFrame();
    frameCount++;

    // Tick timeline engine and animation graph
    timelineEngine.tick(timestamp);
    animationGraph.tick(timestamp);

    // Execute pending one-shot callbacks
    if (pendingCallbacks.size > 0) {
      const callbacks = Array.from(pendingCallbacks.entries());
      pendingCallbacks.clear();
      for (const [, cb] of callbacks) {
        cb(timestamp);
      }
    }

    performanceMonitor?.endFrame();
  }

  const driver: AnimationFrameDriverAPI = {
    // Lifecycle
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

    // Frame scheduling
    scheduleFrame(callback: AnimationFrameCallback): number {
      const id = ++idCounter;
      pendingCallbacks.set(id, callback);
      return id;
    },

    cancelFrame(id: number): void {
      pendingCallbacks.delete(id);
    },

    setTargetFPS(fps: number): void {
      scheduler.setTargetFPS(Math.max(1, fps));
    },

    getFrameCount(): number {
      return frameCount;
    },

    getElapsedTime(): number {
      return initializedAt === 0 ? 0 : Date.now() - initializedAt;
    },

    // Playback controls
    pause(): void {
      paused = true;
      scheduler.stopLoop();
      timelineEngine.pauseAll();
    },

    resume(): void {
      paused = false;
      const effectiveFPS = visibilityController.getEffectiveTargetFPS(targetFPS);
      if (effectiveFPS > 0) {
        scheduler.setTargetFPS(effectiveFPS);
      }
      timelineEngine.resumeAll();
      scheduler.startLoop(mainTick);
    },

    play(): void {
      playbackController.play();
    },

    seek(timeMs: number): void {
      playbackController.seek(timeMs);
    },

    reverse(): void {
      playbackController.reverse();
    },

    setSpeed(multiplier: number): void {
      playbackController.setSpeed(multiplier);
    },

    // Timeline
    createTimeline(config: TimelineConfig) {
      return timelineEngine.create(config);
    },

    // Animation graph
    buildAnimationGraph(root: AnimationNodeConfig) {
      return animationGraph.build(root);
    },

    // Easing
    getEasing(name: EasingName) {
      return getEasing(name);
    },

    createCubicBezier(x1: number, y1: number, x2: number, y2: number) {
      return createCubicBezier(x1, y1, x2, y2);
    },

    // Cleanup
    trackCleanup(target: object, cleanup: () => void): void {
      cleanupManager.track(target, cleanup);
    },

    // Metrics
    getMetrics(): FrameMetrics {
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

    // Sub-module accessors
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
