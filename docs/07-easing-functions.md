# Easing Functions

The driver includes a built-in easing library for common animation curves.

## Built-ins

Families include:

- Linear
- Quad, Cubic, Quart, Quint
- Sine, Expo, Circ
- Elastic, Back, Bounce

Example:

```ts
const ease = driver.getEasing('easeOutCubic');
const value = ease(0.5);
```

## Custom cubic-bezier

```ts
const custom = driver.createCubicBezier(0.25, 0.1, 0.25, 1.0);
```

## Contract

All easing functions are normalized such that:

- `f(0) === 0`
- `f(1) === 1`
