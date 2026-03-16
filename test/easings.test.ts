import { describe, expect, it } from 'vitest';
import { easings, getEasing, createCubicBezier } from '../src/easings';
import type { EasingName } from '../src/types';

describe('easings', () => {
  const allNames = Object.keys(easings) as EasingName[];

  it('all easings return 0 for t=0', () => {
    for (const name of allNames) {
      expect(easings[name](0)).toBeCloseTo(0, 5);
    }
  });

  it('all easings return 1 for t=1', () => {
    for (const name of allNames) {
      expect(easings[name](1)).toBeCloseTo(1, 5);
    }
  });

  it('linear easing is identity', () => {
    for (let t = 0; t <= 1; t += 0.1) {
      expect(easings.linear(t)).toBeCloseTo(t, 10);
    }
  });

  it('has 30+ easing functions', () => {
    expect(allNames.length).toBeGreaterThanOrEqual(30);
  });

  it('getEasing returns correct function', () => {
    expect(getEasing('easeInQuad')).toBe(easings.easeInQuad);
    expect(getEasing('linear')).toBe(easings.linear);
  });

  it('easeInQuad is quadratic', () => {
    expect(easings.easeInQuad(0.5)).toBeCloseTo(0.25, 5);
  });

  it('easeOutBounce produces values in [0,1] range', () => {
    for (let t = 0; t <= 1; t += 0.05) {
      const v = easings.easeOutBounce(t);
      expect(v).toBeGreaterThanOrEqual(-0.01);
      expect(v).toBeLessThanOrEqual(1.01);
    }
  });

  it('easeInBack overshoots below 0', () => {
    // Back easing should go below 0 at small t values
    const v = easings.easeInBack(0.2);
    expect(v).toBeLessThan(0);
  });
});

describe('createCubicBezier', () => {
  it('linear bezier (0,0,1,1) matches linear', () => {
    const bezier = createCubicBezier(0, 0, 1, 1);
    for (let t = 0; t <= 1; t += 0.1) {
      expect(bezier(t)).toBeCloseTo(t, 2);
    }
  });

  it('ease bezier (0.25, 0.1, 0.25, 1.0) returns 0 at 0 and 1 at 1', () => {
    const ease = createCubicBezier(0.25, 0.1, 0.25, 1.0);
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
  });

  it('ease-in-out (0.42, 0, 0.58, 1) is roughly symmetric', () => {
    const easeInOut = createCubicBezier(0.42, 0, 0.58, 1);
    const v1 = easeInOut(0.25);
    const v2 = easeInOut(0.75);
    expect(v1 + v2).toBeCloseTo(1, 1);
  });
});
