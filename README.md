# @obinexusltd/obix-driver-animation-frame

[![npm version](https://img.shields.io/npm/v/@obinexusltd/obix-driver-animation-frame)](https://www.npmjs.com/package/@obinexusltd/obix-driver-animation-frame)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-featured animation scheduling and orchestration driver for the [OBIX SDK](https://github.com/OBINexusComputing/obix-sdk). Solves 10 core browser animation problems: jank & frame drops, timer drift, battery drain, complex timeline orchestration, missing pause/resume, memory leaks, background tab waste, profiling blindness, easing inconsistency, and SSR crashes.

## Installation

```bash
npm install @obinexusltd/obix-driver-animation-frame
```

## Quick Start

```typescript
import { createAnimationFrameDriver } from '@obinexusltd/obix-driver-animation-frame';

const driver = createAnimationFrameDriver({ targetFPS: 60 });
await driver.initialize();

// Schedule a one-shot frame callback
driver.scheduleFrame((timestamp) => {
  console.log('frame at', timestamp);
});

// Create a timed animation
driver.createTimeline({
  duration: 500,
  easing: 'easeOutCubic',
  onFrame: (progress) => {
    element.style.opacity = String(progress);
  },
  onFinish: () => console.log('done'),
});

// Clean up
await driver.destroy();
```

## API Reference

### Driver Lifecycle

```typescript
const driver = createAnimationFrameDriver(config?: AnimationFrameDriverConfig);

await driver.initialize();  // Start the frame loop
await driver.destroy();     // Stop everything and release resources
```

**Config options:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `targetFPS` | `number` | `60` | Target frame rate |
| `adaptToRefreshRate` | `boolean` | `false` | Auto-detect display Hz (60/120/144) |
| `visibility.backgroundFPS` | `number` | `0` | FPS when tab hidden (0 = freeze) |
| `visibility.autoPause` | `boolean` | `true` | Pause automatically on hide |
| `visibility.resumeDelay` | `number` | `0` | ms delay before resuming on refocus |
| `enableMetrics` | `boolean` | `true` | Enable performance monitoring |

---

### Frame Scheduling

```typescript
// Schedule a one-shot callback on the next frame
const id = driver.scheduleFrame((deltaTime: number) => { /* ... */ });

// Cancel before it fires
driver.cancelFrame(id);

// Change target FPS at runtime
driver.setTargetFPS(120);

// Inspect state
driver.getFrameCount();   // Total frames executed
driver.getElapsedTime();  // ms since initialize()
```

---

### Playback Controls

Full transport controls with frame-accurate positioning:

```typescript
driver.pause();           // Freeze all animations
driver.resume();          // Resume from paused
driver.play();            // Start the playback controller loop
driver.seek(1500);        // Jump to 1500ms (snaps to frame boundary)
driver.reverse();         // Toggle playback direction
driver.setSpeed(2.0);     // Play at 2x speed (0.01–∞)
```

---

### Timelines

High-precision monotonic clock timeline with drift correction and time-slicing:

```typescript
const handle = driver.createTimeline({
  duration: 1000,          // ms
  easing: 'easeInOutSine', // named easing or custom function
  delay: 200,              // ms before starting
  iterations: 3,           // repeat count (Infinity for loop)
  direction: 'alternate',  // 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode: 'forwards',    // 'none' | 'forwards' | 'backwards' | 'both'
  onFrame: (progress, deltaMs) => { /* progress: 0–1 eased */ },
  onFinish: () => { /* called when all iterations complete */ },
});

// Control the timeline after creation
handle.play();
handle.pause();
handle.cancel();

// Read state
handle.state;          // 'idle' | 'running' | 'paused' | 'finished'
handle.progress;       // current eased progress (0–1)
handle.currentTime;    // elapsed ms
handle.iterationCount; // which iteration we're on
```

---

### Animation Graphs

DAG-based declarative composition of timelines. Four node types:

| Type | Behavior |
|------|----------|
| `timeline` | Leaf node — runs a single `TimelineConfig` |
| `sequence` | Children run one after another |
| `parallel` | All children run simultaneously |
| `stagger` | Children run with a rolling `staggerDelay` offset |

```typescript
const graph = driver.buildAnimationGraph({
  type: 'sequence',
  children: [
    {
      type: 'timeline',
      timeline: { duration: 300, easing: 'easeOutQuad' },
      onFrame: (p) => { element.style.transform = `translateX(${p * 100}px)`; },
    },
    {
      type: 'parallel',
      children: [
        { type: 'timeline', timeline: { duration: 200 }, onFrame: (p) => { /* fade */ } },
        { type: 'timeline', timeline: { duration: 200 }, onFrame: (p) => { /* scale */ } },
      ],
    },
    {
      type: 'stagger',
      staggerDelay: 80,
      children: items.map((el) => ({
        type: 'timeline',
        timeline: { duration: 250, easing: 'easeOutBack' },
        onFrame: (p) => { el.style.opacity = String(p); },
      })),
    },
  ],
});

graph.play();
graph.pause();
graph.cancel();
graph.onFinish(() => console.log('graph complete'));

graph.state;    // 'idle' | 'running' | 'paused' | 'finished'
graph.progress; // composite progress 0–1
```

---

### Easing Library

30+ built-in easing functions:

```typescript
const easeIn = driver.getEasing('easeInCubic');
easeIn(0.5); // => 0.125

// Custom CSS cubic-bezier (Newton-Raphson)
const customEase = driver.createCubicBezier(0.25, 0.1, 0.25, 1.0);
```

**Available easing names:**

```
linear
easeInQuad      easeOutQuad      easeInOutQuad
easeInCubic     easeOutCubic     easeInOutCubic
easeInQuart     easeOutQuart     easeInOutQuart
easeInQuint     easeOutQuint     easeInOutQuint
easeInSine      easeOutSine      easeInOutSine
easeInExpo      easeOutExpo      easeInOutExpo
easeInCirc      easeOutCirc      easeInOutCirc
easeInElastic   easeOutElastic   easeInOutElastic
easeInBack      easeOutBack      easeInOutBack
easeInBounce    easeOutBounce    easeInOutBounce
```

All easings satisfy `f(0) === 0` and `f(1) === 1`.

---

### Automatic Cleanup

WeakRef-based reference management that prevents memory leaks when components unmount:

```typescript
// Track an object — cleanup fires when GC'd or manually collected
driver.trackCleanup(componentRef, () => {
  driver.cancelFrame(myFrameId);
});

// AbortSignal integration
const controller = new AbortController();
driver.cleanupManager.trackAbortSignal(controller.signal, () => {
  console.log('animation aborted');
});

// Manual GC sweep
const collected = driver.cleanupManager.collectGarbage();
```

---

### Performance Metrics

```typescript
const metrics = driver.getMetrics();

metrics.fps;              // instantaneous FPS
metrics.averageFps;       // rolling 120-frame average
metrics.frameTime;        // last frame duration (ms)
metrics.averageFrameTime; // rolling average
metrics.droppedFrames;    // total frames that took >25ms
metrics.totalFrames;      // total frames executed
metrics.jank;             // frames > 2x rolling average
metrics.histogram;        // FrameTimeHistogram with bucket counts
```

Frame time histogram buckets: `0ms, 4ms, 8ms, 16ms, 33ms, 50ms, 100ms+`

---

### Sub-Module Accessors

Direct access to the underlying sub-modules for advanced use:

```typescript
driver.scheduler           // SchedulerAPI — request/cancel one-shot frames, start/stop loop
driver.timelineEngine      // TimelineEngineAPI — create/tick timelines
driver.visibilityController // VisibilityControllerAPI — Page Visibility state
driver.animationGraph      // AnimationGraphAPI — build/tick DAG graphs
driver.playbackController  // PlaybackControllerAPI — transport state
driver.cleanupManager      // CleanupManagerAPI — WeakRef tracking
driver.performanceMonitor  // PerformanceMonitorAPI | null — metrics
driver.environment         // EnvironmentAdapterAPI — rAF/now polyfill
```

---

## Environment Support

| Environment | Support |
|-------------|---------|
| Browser (rAF) | Full — uses native `requestAnimationFrame` |
| Browser (no rAF) | Fallback via `setTimeout` |
| Node.js | Fallback via `setImmediate` / `setTimeout` |
| SSR / Deno | Graceful no-op — no crashes, `isBrowser: false` |

```typescript
// Safe in SSR — no window/document access at import time
import { createAnimationFrameDriver } from '@obinexusltd/obix-driver-animation-frame';

const driver = createAnimationFrameDriver();
driver.environment.isBrowser; // false in Node/SSR
driver.environment.isNode;    // true in Node
```

---

## Architecture

| Module | Responsibility |
|--------|---------------|
| `environment-adapter` | Isomorphic rAF / `performance.now` polyfills |
| `scheduler` | Adaptive FPS, refresh-rate detection, frame loop |
| `timeline-engine` | Monotonic clock, drift correction, time-slicing |
| `visibility-controller` | Page Visibility API, background throttling |
| `animation-graph` | DAG composition: sequence / parallel / stagger |
| `playback-controller` | Transport: play / pause / seek / reverse / speed |
| `cleanup-manager` | WeakRef + AbortSignal + FinalizationRegistry |
| `performance-monitor` | FPS metrics, histograms, jank/drop detection |
| `easings` | 30+ easing functions + cubic-bezier factory |
| `types` | All shared TypeScript interfaces |

---

## License

MIT — OBINexus <okpalan@protonmail.com>
