# Environment and SSR Support

The environment adapter keeps the driver safe across browser and server contexts.

## Support matrix

- Browser with native `requestAnimationFrame`: full support
- Browser without `requestAnimationFrame`: timeout fallback
- Node.js: immediate/timeout fallback
- SSR: safe import and no direct `window` dependency at module load

## Example

```ts
import { createAnimationFrameDriver } from '@obinexusltd/obix-driver-animation-frame';

const driver = createAnimationFrameDriver();

console.log(driver.environment.isBrowser);
console.log(driver.environment.isNode);
```

## Recommendation

Initialize the driver in lifecycle hooks where rendering context is known.
