/**
 * Built-in Easing Library
 * 30+ easing functions + custom cubic-bezier support.
 */
import type { EasingFunction, EasingName } from './types.js';
export declare const easings: Readonly<Record<EasingName, EasingFunction>>;
export declare function getEasing(name: EasingName): EasingFunction;
/**
 * Creates a cubic-bezier easing function matching CSS cubic-bezier().
 * Uses Newton-Raphson iteration for fast convergence.
 */
export declare function createCubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFunction;
//# sourceMappingURL=easings.d.ts.map