# Animation Graphs

Animation graphs let you compose timelines as a DAG.

## Node types

- `timeline`: single animation node
- `sequence`: runs children serially
- `parallel`: runs children concurrently
- `stagger`: offsets children by `staggerDelay`

## Example

```ts
const graph = driver.buildAnimationGraph({
  type: 'sequence',
  children: [
    {
      type: 'timeline',
      timeline: { duration: 300, easing: 'easeOutQuad' },
      onFrame: (p) => {
        element.style.transform = `translateX(${p * 100}px)`;
      },
    },
    {
      type: 'parallel',
      children: [
        { type: 'timeline', timeline: { duration: 200 } },
        { type: 'timeline', timeline: { duration: 200 } },
      ],
    },
  ],
});

graph.play();
graph.pause();
graph.cancel();
```

## Completion callback

```ts
graph.onFinish(() => console.log('graph complete'));
```
