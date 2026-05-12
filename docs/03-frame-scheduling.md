# Frame Scheduling

Use the scheduler for one-shot frame tasks and loop control.

## Schedule work on next frame

```ts
const id = driver.scheduleFrame((deltaTime) => {
  // frame work
});
```

## Cancel scheduled work

```ts
driver.cancelFrame(id);
```

## Runtime control

```ts
driver.setTargetFPS(120);
const frames = driver.getFrameCount();
const elapsed = driver.getElapsedTime();
```

## Guidance

- Keep frame callbacks lightweight.
- Use timeline/graph APIs for stateful animation flows.
- Increase target FPS only when necessary and measurable.
