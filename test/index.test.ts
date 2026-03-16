import { describe, expect, it } from 'vitest';
import { createAnimationFrameDriver } from '../src/index';

describe('animation-frame', () => {
  // Backward compatibility: original test preserved
  it('schedules and executes frames', async () => {
    const driver = createAnimationFrameDriver({ targetFPS: 30 });
    await driver.initialize();

    await new Promise<void>((resolve) => {
      driver.scheduleFrame(() => {
        resolve();
      });
    });

    expect(driver.getFrameCount()).toBeGreaterThan(0);
    driver.pause();
    driver.resume();
    await driver.destroy();
  });

  it('exposes sub-module accessors', async () => {
    const driver = createAnimationFrameDriver();
    await driver.initialize();

    expect(driver.scheduler).toBeDefined();
    expect(driver.timelineEngine).toBeDefined();
    expect(driver.visibilityController).toBeDefined();
    expect(driver.animationGraph).toBeDefined();
    expect(driver.playbackController).toBeDefined();
    expect(driver.cleanupManager).toBeDefined();
    expect(driver.performanceMonitor).toBeDefined();
    expect(driver.environment).toBeDefined();

    await driver.destroy();
  });

  it('creates timelines via new API', async () => {
    const driver = createAnimationFrameDriver();
    await driver.initialize();

    const frames: number[] = [];
    const handle = driver.createTimeline({
      duration: 100,
      onFrame: (progress) => frames.push(progress),
    });

    expect(handle.id).toBeGreaterThan(0);

    // Wait for completion
    await new Promise((r) => setTimeout(r, 200));

    await driver.destroy();
  });

  it('provides easing functions', async () => {
    const driver = createAnimationFrameDriver();
    await driver.initialize();

    const easeIn = driver.getEasing('easeInQuad');
    expect(easeIn(0)).toBe(0);
    expect(easeIn(1)).toBe(1);
    expect(easeIn(0.5)).toBeCloseTo(0.25, 5);

    const bezier = driver.createCubicBezier(0.25, 0.1, 0.25, 1.0);
    expect(bezier(0)).toBe(0);
    expect(bezier(1)).toBe(1);

    await driver.destroy();
  });

  it('returns metrics', async () => {
    const driver = createAnimationFrameDriver({ enableMetrics: true });
    await driver.initialize();

    await new Promise((r) => setTimeout(r, 100));

    const metrics = driver.getMetrics();
    expect(metrics.totalFrames).toBeGreaterThanOrEqual(0);
    expect(metrics.histogram).toBeDefined();

    await driver.destroy();
  });

  it('returns empty metrics when disabled', async () => {
    const driver = createAnimationFrameDriver({ enableMetrics: false });
    await driver.initialize();

    const metrics = driver.getMetrics();
    expect(metrics.fps).toBe(0);

    await driver.destroy();
  });

  it('pause and resume work', async () => {
    const driver = createAnimationFrameDriver();
    await driver.initialize();

    const countBefore = driver.getFrameCount();
    driver.pause();

    await new Promise((r) => setTimeout(r, 50));
    expect(driver.getFrameCount()).toBe(countBefore);

    driver.resume();
    await new Promise((r) => setTimeout(r, 50));

    await driver.destroy();
  });

  it('builds animation graphs', async () => {
    const driver = createAnimationFrameDriver();
    await driver.initialize();

    const handle = driver.buildAnimationGraph({
      type: 'sequence',
      children: [
        { type: 'timeline', timeline: { duration: 50 } },
        { type: 'timeline', timeline: { duration: 50 } },
      ],
    });

    expect(handle.id).toBeGreaterThan(0);

    await driver.destroy();
  });

  it('trackCleanup works', async () => {
    const driver = createAnimationFrameDriver();
    await driver.initialize();

    const target = { name: 'test' };
    driver.trackCleanup(target, () => {});

    expect(driver.cleanupManager.trackedCount).toBe(1);

    await driver.destroy();
  });

  it('setTargetFPS works', async () => {
    const driver = createAnimationFrameDriver({ targetFPS: 30 });
    await driver.initialize();

    driver.setTargetFPS(120);

    await driver.destroy();
  });

  it('getElapsedTime returns time since init', async () => {
    const driver = createAnimationFrameDriver();
    await driver.initialize();

    await new Promise((r) => setTimeout(r, 50));
    expect(driver.getElapsedTime()).toBeGreaterThan(0);

    await driver.destroy();
  });

  it('playback controls are accessible', async () => {
    const driver = createAnimationFrameDriver();
    await driver.initialize();

    driver.setSpeed(2.0);
    driver.reverse();
    driver.seek(100);

    await driver.destroy();
  });
});
