import { describe, expect, it, vi } from 'vitest';
import { createVisibilityController } from '../src/visibility-controller';
import { createEnvironmentAdapter } from '../src/environment-adapter';

describe('visibility-controller', () => {
  it('creates controller with default visibility', () => {
    const env = createEnvironmentAdapter();
    const controller = createVisibilityController(env);

    expect(typeof controller.isVisible).toBe('boolean');
    expect(typeof controller.isThrottled).toBe('boolean');

    controller.destroy();
    env.destroy();
  });

  it('getEffectiveTargetFPS returns baseFPS when visible', () => {
    const env = createEnvironmentAdapter();
    const controller = createVisibilityController(env);

    // Default: visible
    expect(controller.getEffectiveTargetFPS(60)).toBe(60);

    controller.destroy();
    env.destroy();
  });

  it('registers and removes callbacks', () => {
    const env = createEnvironmentAdapter();
    const controller = createVisibilityController(env);
    const fn = vi.fn();

    controller.onVisibilityChange(fn);
    controller.removeVisibilityCallback(fn);

    // No error means success
    controller.destroy();
    env.destroy();
  });

  it('destroy cleans up without errors', () => {
    const env = createEnvironmentAdapter();
    const controller = createVisibilityController(env, {
      backgroundFPS: 1,
      autoPause: true,
      resumeDelay: 100,
    });

    controller.destroy();
    env.destroy();
  });
});
