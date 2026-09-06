import type { EasingFunction, EasingName } from './types.js';
export declare const easings: Readonly<Record<EasingName, EasingFunction>>;
export declare function getEasing(name: EasingName): EasingFunction;
export declare function createCubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFunction;
//# sourceMappingURL=easings.d.ts.map