export type { EasingFunction, EasingName, AnimationFrameCallback, EnvironmentAdapterAPI, SchedulerConfig, SchedulerAPI, TimelineDirection, TimelineFillMode, TimelineState, TimelineConfig, TimelineHandle, TimelineEngineAPI, VisibilityConfig, VisibilityControllerAPI, AnimationNodeType, AnimationNodeConfig, AnimationGraphState, AnimationGraphHandle, AnimationGraphAPI, PlaybackState, PlaybackControllerAPI, CleanupManagerAPI, FrameTimeHistogram, FrameMetrics, PerformanceMonitorAPI, LegacyTimeline, AnimationFrameDriverConfig, AnimationFrameDriverAPI, } from './types.js';
export { createEnvironmentAdapter } from './environment-adapter.js';
export { easings, getEasing, createCubicBezier } from './easings.js';
export { createScheduler } from './scheduler.js';
export { createTimelineEngine } from './timeline-engine.js';
export { createVisibilityController } from './visibility-controller.js';
export { createAnimationGraph } from './animation-graph.js';
export { createPlaybackController } from './playback-controller.js';
export { createCleanupManager } from './cleanup-manager.js';
export { createPerformanceMonitor } from './performance-monitor.js';
import type { AnimationFrameDriverAPI, AnimationFrameDriverConfig } from './types.js';
export declare function createAnimationFrameDriver(config?: AnimationFrameDriverConfig): AnimationFrameDriverAPI;
//# sourceMappingURL=index.d.ts.map