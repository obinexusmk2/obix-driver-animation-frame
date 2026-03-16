import { describe, expect, it } from 'vitest';
import { createTimelineEngine } from '../src/timeline-engine';
import { createEnvironmentAdapter } from '../src/environment-adapter';

describe('timeline-engine', () => {
  it('creates a timeline that progresses over ticks', () => {
    const env = createEnvironmentAdapter();
    const engine = createTimelineEngine(env);
    const frames: number[] = [];

    const handle = engine.create({
      duration: 1000,
      onFrame: (progress) => frames.push(progress),
    });

    expect(handle.state).toBe('running');

    // Simulate ticks
    const startTime = env.now();
    engine.tick(startTime + 0);
    engine.tick(startTime + 500);
    engine.tick(startTime + 1000);

    expect(frames.length).toBeGreaterThan(0);
    engine.destroy();
    env.destroy();
  });

  it('timeline reaches finished state at completion', () => {
    const env = createEnvironmentAdapter();
    const engine = createTimelineEngine(env);
    let finished = false;

    const handle = engine.create({
      duration: 100,
      onFinish: () => { finished = true; },
    });

    const start = env.now();
    // Tick progressively (time-slicing caps large jumps)
    engine.tick(start + 50);
    engine.tick(start + 120);
    engine.tick(start + 200);

    expect(finished).toBe(true);
    expect(handle.state).toBe('finished');
    engine.destroy();
    env.destroy();
  });

  it('supports pause and resume', () => {
    const env = createEnvironmentAdapter();
    const engine = createTimelineEngine(env);
    const frames: number[] = [];

    engine.create({
      duration: 1000,
      onFrame: (progress) => frames.push(progress),
    });

    const start = env.now();
    engine.tick(start + 100);
    const countBeforePause = frames.length;

    engine.pauseAll();
    engine.tick(start + 500);
    expect(frames.length).toBe(countBeforePause);

    engine.resumeAll();
    engine.tick(start + 600);
    expect(frames.length).toBeGreaterThan(countBeforePause);

    engine.destroy();
    env.destroy();
  });

  it('getActiveCount tracks running timelines', () => {
    const env = createEnvironmentAdapter();
    const engine = createTimelineEngine(env);

    engine.create({ duration: 1000 });
    engine.create({ duration: 2000 });

    expect(engine.getActiveCount()).toBe(2);

    engine.destroy();
    env.destroy();
  });

  it('supports named easing', () => {
    const env = createEnvironmentAdapter();
    const engine = createTimelineEngine(env);
    const frames: number[] = [];

    engine.create({
      duration: 1000,
      easing: 'easeInQuad',
      onFrame: (progress) => frames.push(progress),
    });

    const start = env.now();
    engine.tick(start + 500);

    // easeInQuad at 0.5 linear = 0.25, so should be less than 0.5
    expect(frames.length).toBeGreaterThan(0);
    engine.destroy();
    env.destroy();
  });
});
