import { describe, expect, it } from 'vitest';
import { createPerformanceMonitor } from '../src/performance-monitor';
import { createEnvironmentAdapter } from '../src/environment-adapter';

describe('performance-monitor', () => {
  it('tracks frame metrics', () => {
    const env = createEnvironmentAdapter();
    const monitor = createPerformanceMonitor(env);

    monitor.beginFrame();
    monitor.endFrame();
    monitor.beginFrame();
    monitor.endFrame();

    const metrics = monitor.getMetrics();
    expect(metrics.totalFrames).toBe(2);
    expect(metrics.fps).toBeGreaterThanOrEqual(0);
    expect(metrics.averageFps).toBeGreaterThanOrEqual(0);
    expect(metrics.histogram).toBeDefined();
    expect(metrics.histogram.buckets.length).toBeGreaterThan(0);

    monitor.destroy();
    env.destroy();
  });

  it('reset clears all metrics', () => {
    const env = createEnvironmentAdapter();
    const monitor = createPerformanceMonitor(env);

    monitor.beginFrame();
    monitor.endFrame();
    monitor.reset();

    const metrics = monitor.getMetrics();
    expect(metrics.totalFrames).toBe(0);
    expect(metrics.droppedFrames).toBe(0);
    expect(metrics.jank).toBe(0);

    monitor.destroy();
    env.destroy();
  });

  it('histogram has correct bucket structure', () => {
    const env = createEnvironmentAdapter();
    const monitor = createPerformanceMonitor(env);

    monitor.beginFrame();
    monitor.endFrame();

    const { histogram } = monitor.getMetrics();
    expect(histogram.buckets).toContain(0);
    expect(histogram.buckets).toContain(16);
    expect(histogram.counts.length).toBe(histogram.buckets.length + 1);

    monitor.destroy();
    env.destroy();
  });
});
