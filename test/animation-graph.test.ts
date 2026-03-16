import { describe, expect, it } from 'vitest';
import { createAnimationGraph } from '../src/animation-graph';
import { createTimelineEngine } from '../src/timeline-engine';
import { createEnvironmentAdapter } from '../src/environment-adapter';

describe('animation-graph', () => {
  function setup() {
    const env = createEnvironmentAdapter();
    const timelineEngine = createTimelineEngine(env);
    const graph = createAnimationGraph(timelineEngine);
    return { env, timelineEngine, graph };
  }

  function teardown(ctx: ReturnType<typeof setup>) {
    ctx.graph.destroy();
    ctx.timelineEngine.destroy();
    ctx.env.destroy();
  }

  it('builds a timeline node', () => {
    const ctx = setup();
    const handle = ctx.graph.build({
      type: 'timeline',
      timeline: { duration: 1000 },
    });

    expect(handle.id).toBeGreaterThan(0);
    expect(handle.state).toBe('idle');
    teardown(ctx);
  });

  it('builds a sequence graph', () => {
    const ctx = setup();
    const handle = ctx.graph.build({
      type: 'sequence',
      children: [
        { type: 'timeline', timeline: { duration: 500 } },
        { type: 'timeline', timeline: { duration: 500 } },
      ],
    });

    expect(handle.id).toBeGreaterThan(0);
    handle.play();
    expect(handle.state).toBe('running');
    teardown(ctx);
  });

  it('builds a parallel graph', () => {
    const ctx = setup();
    const handle = ctx.graph.build({
      type: 'parallel',
      children: [
        { type: 'timeline', timeline: { duration: 500 } },
        { type: 'timeline', timeline: { duration: 1000 } },
      ],
    });

    handle.play();
    expect(handle.state).toBe('running');
    teardown(ctx);
  });

  it('builds a stagger graph', () => {
    const ctx = setup();
    const handle = ctx.graph.build({
      type: 'stagger',
      staggerDelay: 100,
      children: [
        { type: 'timeline', timeline: { duration: 300 } },
        { type: 'timeline', timeline: { duration: 300 } },
        { type: 'timeline', timeline: { duration: 300 } },
      ],
    });

    handle.play();
    expect(handle.state).toBe('running');
    teardown(ctx);
  });

  it('pause and cancel work on graph', () => {
    const ctx = setup();
    const handle = ctx.graph.build({
      type: 'parallel',
      children: [
        { type: 'timeline', timeline: { duration: 1000 } },
      ],
    });

    handle.play();
    handle.pause();
    expect(handle.state).toBe('paused');

    handle.cancel();
    expect(handle.state).toBe('finished');
    teardown(ctx);
  });

  it('onFinish callback is registered', () => {
    const ctx = setup();
    let finished = false;

    const handle = ctx.graph.build({
      type: 'timeline',
      timeline: { duration: 100 },
    });

    handle.onFinish(() => { finished = true; });
    expect(finished).toBe(false);
    teardown(ctx);
  });

  it('empty sequence/parallel finishes immediately', () => {
    const ctx = setup();

    const seq = ctx.graph.build({ type: 'sequence', children: [] });
    seq.play();
    expect(seq.state).toBe('finished');

    const par = ctx.graph.build({ type: 'parallel', children: [] });
    par.play();
    expect(par.state).toBe('finished');

    teardown(ctx);
  });
});
