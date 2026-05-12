# Playback Controls

The playback controller provides transport-like control across active animation flows.

## API

```ts
driver.play();
driver.pause();
driver.resume();
driver.seek(1500);
driver.reverse();
driver.setSpeed(1.5);
```

## Behavior notes

- `seek(ms)` aligns to frame boundaries for stable sampling.
- `reverse()` toggles playback direction.
- `setSpeed(value)` accepts positive values above zero.

## Typical use cases

- Scrubbable UI previews
- Time-travel debugging
- Slow-motion QA and demo modes
