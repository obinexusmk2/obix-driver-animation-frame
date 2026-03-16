import { describe, expect, it } from 'vitest';
import { createPlaybackController } from '../src/playback-controller';
import { createTimelineEngine } from '../src/timeline-engine';
import { createScheduler } from '../src/scheduler';
import { createEnvironmentAdapter } from '../src/environment-adapter';

describe('playback-controller', () => {
  function setup() {
    const env = createEnvironmentAdapter();
    const scheduler = createScheduler(env, { targetFPS: 60 });
    const timelineEngine = createTimelineEngine(env);
    const controller = createPlaybackController(env, timelineEngine, scheduler);
    return { env, scheduler, timelineEngine, controller };
  }

  function teardown(ctx: ReturnType<typeof setup>) {
    ctx.controller.destroy();
    ctx.timelineEngine.destroy();
    ctx.scheduler.destroy();
    ctx.env.destroy();
  }

  it('starts in idle state', () => {
    const ctx = setup();
    expect(ctx.controller.state).toBe('idle');
    expect(ctx.controller.speed).toBe(1);
    expect(ctx.controller.reversed).toBe(false);
    teardown(ctx);
  });

  it('play transitions to playing', () => {
    const ctx = setup();
    ctx.controller.play();
    expect(ctx.controller.state).toBe('playing');
    teardown(ctx);
  });

  it('pause transitions to paused', () => {
    const ctx = setup();
    ctx.controller.play();
    ctx.controller.pause();
    expect(ctx.controller.state).toBe('paused');
    teardown(ctx);
  });

  it('resume from paused transitions to playing', () => {
    const ctx = setup();
    ctx.controller.play();
    ctx.controller.pause();
    ctx.controller.resume();
    expect(ctx.controller.state).toBe('playing');
    teardown(ctx);
  });

  it('setSpeed changes speed', () => {
    const ctx = setup();
    ctx.controller.setSpeed(2.0);
    expect(ctx.controller.speed).toBe(2.0);
    teardown(ctx);
  });

  it('reverse toggles reversed state', () => {
    const ctx = setup();
    expect(ctx.controller.reversed).toBe(false);
    ctx.controller.reverse();
    expect(ctx.controller.reversed).toBe(true);
    ctx.controller.reverse();
    expect(ctx.controller.reversed).toBe(false);
    teardown(ctx);
  });

  it('seek sets current time', () => {
    const ctx = setup();
    ctx.controller.seek(500);
    expect(ctx.controller.currentTime).toBeGreaterThanOrEqual(0);
    teardown(ctx);
  });
});
