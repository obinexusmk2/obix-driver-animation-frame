/**
 * Performance Metrics & DevTools
 * Real-time FPS monitoring, frame time histograms, and dropped frame detection.
 */

import type { EnvironmentAdapterAPI, FrameMetrics, FrameTimeHistogram, PerformanceMonitorAPI } from './types.js';

const HISTOGRAM_BUCKETS = [0, 4, 8, 16, 33, 50, 100] as const;
const WINDOW_SIZE = 120;

export function createPerformanceMonitor(
  environment: EnvironmentAdapterAPI
): PerformanceMonitorAPI {
  let frameStart = 0;
  let totalFrames = 0;
  let droppedFrames = 0;
  let jankCount = 0;
  let lastFrameTime = 0;

  const frameTimes: number[] = [];
  const histogramCounts: number[] = new Array(HISTOGRAM_BUCKETS.length + 1).fill(0);

  function addFrameTime(ms: number): void {
    frameTimes.push(ms);
    if (frameTimes.length > WINDOW_SIZE) {
      frameTimes.shift();
    }

    // Place in histogram bucket
    let placed = false;
    for (let i = 0; i < HISTOGRAM_BUCKETS.length - 1; i++) {
      if (ms >= HISTOGRAM_BUCKETS[i] && ms < HISTOGRAM_BUCKETS[i + 1]) {
        histogramCounts[i]++;
        placed = true;
        break;
      }
    }
    if (!placed) {
      // Last bucket: >= 100ms
      histogramCounts[HISTOGRAM_BUCKETS.length - 1]++;
    }
  }

  function getAverage(): number {
    if (frameTimes.length === 0) return 0;
    let sum = 0;
    for (const t of frameTimes) sum += t;
    return sum / frameTimes.length;
  }

  return {
    beginFrame(): void {
      frameStart = environment.now();
    },

    endFrame(): void {
      const elapsed = environment.now() - frameStart;
      totalFrames++;
      lastFrameTime = elapsed;
      addFrameTime(elapsed);

      const avg = getAverage();

      // Dropped frame: took more than 1.5x expected 16.67ms frame
      if (elapsed > 25) {
        droppedFrames += Math.max(0, Math.floor(elapsed / 16.67) - 1);
      }

      // Jank: frame > 2x rolling average
      if (avg > 0 && elapsed > avg * 2) {
        jankCount++;
      }
    },

    getMetrics(): FrameMetrics {
      const avg = getAverage();
      const histogram: FrameTimeHistogram = {
        buckets: HISTOGRAM_BUCKETS,
        counts: [...histogramCounts],
      };

      return {
        fps: lastFrameTime > 0 ? 1000 / lastFrameTime : 0,
        averageFps: avg > 0 ? 1000 / avg : 0,
        frameTime: lastFrameTime,
        averageFrameTime: avg,
        droppedFrames,
        totalFrames,
        jank: jankCount,
        histogram,
      };
    },

    reset(): void {
      totalFrames = 0;
      droppedFrames = 0;
      jankCount = 0;
      lastFrameTime = 0;
      frameStart = 0;
      frameTimes.length = 0;
      histogramCounts.fill(0);
    },

    destroy(): void {
      this.reset();
    },
  };
}
