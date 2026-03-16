/**
 * Built-in Easing Library
 * 30+ easing functions + custom cubic-bezier support.
 */
const PI = Math.PI;
const HALF_PI = PI / 2;
const TAU = PI * 2;
// Back overshoot constant
const c1 = 1.70158;
const c2 = c1 * 1.525;
const c3 = c1 + 1;
// Bounce constants
const n1 = 7.5625;
const d1 = 2.75;
function bounceOut(t) {
    if (t < 1 / d1) {
        return n1 * t * t;
    }
    else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
    }
    else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
    }
    else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
}
export const easings = Object.freeze({
    // Linear
    linear: (t) => t,
    // Quad
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    // Cubic
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    // Quart
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - (--t) * t * t * t,
    easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    // Quint
    easeInQuint: (t) => t * t * t * t * t,
    easeOutQuint: (t) => 1 + (--t) * t * t * t * t,
    easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
    // Sine
    easeInSine: (t) => 1 - Math.cos(t * HALF_PI),
    easeOutSine: (t) => Math.sin(t * HALF_PI),
    easeInOutSine: (t) => -(Math.cos(PI * t) - 1) / 2,
    // Expo
    easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
    easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeInOutExpo: (t) => {
        if (t === 0)
            return 0;
        if (t === 1)
            return 1;
        return t < 0.5
            ? Math.pow(2, 20 * t - 10) / 2
            : (2 - Math.pow(2, -20 * t + 10)) / 2;
    },
    // Circ
    easeInCirc: (t) => 1 - Math.sqrt(1 - t * t),
    easeOutCirc: (t) => Math.sqrt(1 - (--t) * t),
    easeInOutCirc: (t) => t < 0.5
        ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
        : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2,
    // Elastic
    easeInElastic: (t) => {
        if (t === 0)
            return 0;
        if (t === 1)
            return 1;
        return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (TAU / 3));
    },
    easeOutElastic: (t) => {
        if (t === 0)
            return 0;
        if (t === 1)
            return 1;
        return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1;
    },
    easeInOutElastic: (t) => {
        if (t === 0)
            return 0;
        if (t === 1)
            return 1;
        return t < 0.5
            ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (TAU / 4.5))) / 2
            : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (TAU / 4.5))) / 2 + 1;
    },
    // Back
    easeInBack: (t) => c3 * t * t * t - c1 * t * t,
    easeOutBack: (t) => 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2),
    easeInOutBack: (t) => t < 0.5
        ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2,
    // Bounce
    easeInBounce: (t) => 1 - bounceOut(1 - t),
    easeOutBounce: bounceOut,
    easeInOutBounce: (t) => t < 0.5
        ? (1 - bounceOut(1 - 2 * t)) / 2
        : (1 + bounceOut(2 * t - 1)) / 2,
});
export function getEasing(name) {
    return easings[name];
}
/**
 * Creates a cubic-bezier easing function matching CSS cubic-bezier().
 * Uses Newton-Raphson iteration for fast convergence.
 */
export function createCubicBezier(x1, y1, x2, y2) {
    // Pre-compute coefficients for the bezier curve
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    function sampleX(t) {
        return ((ax * t + bx) * t + cx) * t;
    }
    function sampleY(t) {
        return ((ay * t + by) * t + cy) * t;
    }
    function sampleDerivativeX(t) {
        return (3 * ax * t + 2 * bx) * t + cx;
    }
    function solveCurveX(x) {
        // Newton-Raphson iteration
        let t = x;
        for (let i = 0; i < 8; i++) {
            const currentX = sampleX(t) - x;
            if (Math.abs(currentX) < 1e-7)
                return t;
            const derivative = sampleDerivativeX(t);
            if (Math.abs(derivative) < 1e-7)
                break;
            t -= currentX / derivative;
        }
        // Fall back to binary search
        let lo = 0;
        let hi = 1;
        t = x;
        while (lo < hi) {
            const mid = sampleX(t);
            if (Math.abs(mid - x) < 1e-7)
                return t;
            if (x > mid) {
                lo = t;
            }
            else {
                hi = t;
            }
            t = (hi - lo) / 2 + lo;
        }
        return t;
    }
    return (t) => {
        if (t === 0)
            return 0;
        if (t === 1)
            return 1;
        return sampleY(solveCurveX(t));
    };
}
//# sourceMappingURL=easings.js.map