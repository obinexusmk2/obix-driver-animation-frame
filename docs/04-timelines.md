# Timelines

Timelines model finite or repeating animations with deterministic progress.

## Create a timeline

```ts
const handle = driver.createTimeline({
  duration: 1000,
  delay: 100,
  easing: 'easeInOutSine',
  iterations: 2,
  direction: 'alternate',
  fillMode: 'forwards',
  onFrame: (progress, deltaMs) => {
    element.style.opacity = String(progress);
  },
  onFinish: () => {
    console.log('timeline finished');
  },
});
```

## Control a timeline

```ts
handle.play();
handle.pause();
handle.cancel();
```

## Inspect state

```ts
handle.state;
handle.progress;
handle.currentTime;
handle.iterationCount;
```
