# Installation and Setup

## Install

```bash
npm install @obinexusltd/obix-driver-animation-frame
```

## Basic setup

```ts
import { createAnimationFrameDriver } from '@obinexusltd/obix-driver-animation-frame';

const driver = createAnimationFrameDriver({
  targetFPS: 60,
  adaptToRefreshRate: false,
  visibility: {
    backgroundFPS: 0,
    autoPause: true,
    resumeDelay: 0,
  },
  enableMetrics: true,
});

await driver.initialize();
```

## Shutdown

Always call `destroy()` when your app, component, or route unmounts:

```ts
await driver.destroy();
```

This ensures frame loops, callbacks, and cleanup hooks are released.
