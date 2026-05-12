# Animation Frame Driver Overview

`@obinexusltd/obix-driver-animation-frame` is an orchestration-focused animation driver for browser and isomorphic runtimes.

## What it solves

- Frame jank and dropped animations
- Timer drift in long-running timelines
- Background-tab battery waste
- Missing pause/resume/seek transport controls
- Animation composition complexity
- Cleanup and memory-leak risk
- Limited runtime performance visibility

## Core features

- Adaptive frame scheduler with FPS targeting
- High-precision timeline engine with drift correction
- Playback transport (`play`, `pause`, `resume`, `seek`, `reverse`, `setSpeed`)
- Declarative animation graph support (`timeline`, `sequence`, `parallel`, `stagger`)
- 30+ easing functions + cubic-bezier factory
- Automatic cleanup primitives
- Performance metrics + histogram data
- Browser, Node.js, and SSR-safe behavior

## Primary entrypoint

```ts
import { createAnimationFrameDriver } from '@obinexusltd/obix-driver-animation-frame';

const driver = createAnimationFrameDriver({ targetFPS: 60 });
await driver.initialize();
// ... animate ...
await driver.destroy();
```
