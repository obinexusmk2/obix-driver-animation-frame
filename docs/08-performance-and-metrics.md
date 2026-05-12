# Performance and Metrics

Enable metrics to monitor runtime animation health.

## Read metrics

```ts
const metrics = driver.getMetrics();

console.log(metrics.fps);
console.log(metrics.averageFps);
console.log(metrics.frameTime);
console.log(metrics.averageFrameTime);
console.log(metrics.droppedFrames);
console.log(metrics.totalFrames);
console.log(metrics.jank);
console.log(metrics.histogram);
```

## Histogram buckets

Frame-time distribution includes buckets around:

- 0ms
- 4ms
- 8ms
- 16ms
- 33ms
- 50ms
- 100ms+

## Practical thresholds

- Consistent frame times under ~16ms generally support 60 FPS.
- Watch dropped-frame growth under user interaction spikes.
