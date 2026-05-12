# Cleanup and Best Practices

## Automatic cleanup

Use cleanup tracking for lifecycle-safe animation ownership.

```ts
driver.trackCleanup(componentRef, () => {
  driver.cancelFrame(frameId);
});
```

## AbortSignal integration

```ts
const controller = new AbortController();
driver.cleanupManager.trackAbortSignal(controller.signal, () => {
  console.log('animation aborted');
});
```

## Manual garbage collection sweep

```ts
const collected = driver.cleanupManager.collectGarbage();
console.log('cleaned', collected);
```

## Best practices checklist

- Initialize once per lifecycle scope.
- Destroy on teardown.
- Keep frame callbacks minimal.
- Prefer timelines/graphs for complex choreography.
- Track cancel paths for every scheduled unit of work.
