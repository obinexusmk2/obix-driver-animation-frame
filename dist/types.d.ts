/**
 * Animation Frame Driver - Type Definitions
 * All shared interfaces and type aliases for the animation frame driver.
 */
export type EasingFunction = (t: number) => number;
export type EasingName = 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' | 'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart' | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint' | 'easeInSine' | 'easeOutSine' | 'easeInOutSine' | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo' | 'easeInCirc' | 'easeOutCirc' | 'easeInOutCirc' | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic' | 'easeInBack' | 'easeOutBack' | 'easeInOutBack' | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce';
export interface AnimationFrameCallback {
    (deltaTime: number): void;
}
export interface EnvironmentAdapterAPI {
    readonly isBrowser: boolean;
    readonly isNode: boolean;
    readonly hasRAF: boolean;
    requestFrame(callback: (timestamp: number) => void): number;
    cancelFrame(id: number): void;
    now(): number;
    destroy(): void;
}
export interface SchedulerConfig {
    targetFPS?: number;
    adaptToRefreshRate?: boolean;
}
export interface SchedulerAPI {
    request(callback: (timestamp: number) => void): number;
    cancel(id: number): void;
    startLoop(tick: (timestamp: number) => void): void;
    stopLoop(): void;
    setTargetFPS(fps: number): void;
    getDetectedRefreshRate(): number;
    destroy(): void;
}
export type TimelineDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
export type TimelineFillMode = 'none' | 'forwards' | 'backwards' | 'both';
export type TimelineState = 'idle' | 'running' | 'paused' | 'finished';
export interface TimelineConfig {
    duration: number;
    easing?: EasingFunction | EasingName;
    delay?: number;
    iterations?: number;
    direction?: TimelineDirection;
    fillMode?: TimelineFillMode;
    onFrame?: (progress: number, deltaMs: number) => void;
    onFinish?: () => void;
}
export interface TimelineHandle {
    readonly id: number;
    readonly state: TimelineState;
    readonly progress: number;
    readonly currentTime: number;
    readonly iterationCount: number;
    play(): void;
    pause(): void;
    cancel(): void;
}
export interface TimelineEngineAPI {
    create(config: TimelineConfig): TimelineHandle;
    tick(timestamp: number): void;
    getActiveCount(): number;
    pauseAll(): void;
    resumeAll(): void;
    destroy(): void;
}
export interface VisibilityConfig {
    backgroundFPS?: number;
    autoPause?: boolean;
    resumeDelay?: number;
}
export interface VisibilityControllerAPI {
    readonly isVisible: boolean;
    readonly isThrottled: boolean;
    onVisibilityChange(callback: (visible: boolean) => void): void;
    removeVisibilityCallback(callback: (visible: boolean) => void): void;
    getEffectiveTargetFPS(baseFPS: number): number;
    destroy(): void;
}
export type AnimationNodeType = 'timeline' | 'sequence' | 'parallel' | 'stagger';
export interface AnimationNodeConfig {
    type: AnimationNodeType;
    timeline?: TimelineConfig;
    children?: AnimationNodeConfig[];
    staggerDelay?: number;
    onFrame?: (progress: number) => void;
}
export type AnimationGraphState = 'idle' | 'running' | 'paused' | 'finished';
export interface AnimationGraphHandle {
    readonly id: number;
    readonly state: AnimationGraphState;
    readonly progress: number;
    play(): void;
    pause(): void;
    cancel(): void;
    onFinish(callback: () => void): void;
}
export interface AnimationGraphAPI {
    build(root: AnimationNodeConfig): AnimationGraphHandle;
    tick(timestamp: number): void;
    destroy(): void;
}
export type PlaybackState = 'idle' | 'playing' | 'paused';
export interface PlaybackControllerAPI {
    play(): void;
    pause(): void;
    resume(): void;
    seek(timeMs: number): void;
    reverse(): void;
    setSpeed(multiplier: number): void;
    readonly state: PlaybackState;
    readonly speed: number;
    readonly reversed: boolean;
    readonly currentTime: number;
    destroy(): void;
}
export interface CleanupManagerAPI {
    track(target: object, cleanup: () => void): void;
    trackAbortSignal(signal: AbortSignal, cleanup: () => void): void;
    collectGarbage(): number;
    readonly trackedCount: number;
    destroy(): void;
}
export interface FrameTimeHistogram {
    readonly buckets: readonly number[];
    readonly counts: number[];
}
export interface FrameMetrics {
    fps: number;
    averageFps: number;
    frameTime: number;
    averageFrameTime: number;
    droppedFrames: number;
    totalFrames: number;
    jank: number;
    histogram: FrameTimeHistogram;
}
export interface PerformanceMonitorAPI {
    beginFrame(): void;
    endFrame(): void;
    getMetrics(): FrameMetrics;
    reset(): void;
    destroy(): void;
}
export interface LegacyTimeline {
    duration: number;
    easing?: EasingFunction;
    startTime: number;
    onFrame(progress: number): void;
}
export interface AnimationFrameDriverConfig {
    targetFPS?: number;
    adaptToRefreshRate?: boolean;
    autoThrottle?: boolean;
    visibility?: VisibilityConfig;
    timelineCapacity?: number;
    enableMetrics?: boolean;
}
export interface AnimationFrameDriverAPI {
    initialize(): Promise<void>;
    destroy(): Promise<void>;
    scheduleFrame(callback: AnimationFrameCallback): number;
    cancelFrame(id: number): void;
    setTargetFPS(fps: number): void;
    getFrameCount(): number;
    getElapsedTime(): number;
    pause(): void;
    resume(): void;
    play(): void;
    seek(timeMs: number): void;
    reverse(): void;
    setSpeed(multiplier: number): void;
    createTimeline(config: TimelineConfig): TimelineHandle;
    buildAnimationGraph(root: AnimationNodeConfig): AnimationGraphHandle;
    getEasing(name: EasingName): EasingFunction;
    createCubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFunction;
    trackCleanup(target: object, cleanup: () => void): void;
    getMetrics(): FrameMetrics;
    readonly scheduler: SchedulerAPI;
    readonly timelineEngine: TimelineEngineAPI;
    readonly visibilityController: VisibilityControllerAPI;
    readonly animationGraph: AnimationGraphAPI;
    readonly playbackController: PlaybackControllerAPI;
    readonly cleanupManager: CleanupManagerAPI;
    readonly performanceMonitor: PerformanceMonitorAPI | null;
    readonly environment: EnvironmentAdapterAPI;
}
//# sourceMappingURL=types.d.ts.map