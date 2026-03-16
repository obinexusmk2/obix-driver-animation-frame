/**
 * Playback Control API
 * Full transport controls: play, pause, resume, seek, reverse, speed.
 */

import type {
  EnvironmentAdapterAPI,
  PlaybackControllerAPI,
  PlaybackState,
  SchedulerAPI,
  TimelineEngineAPI,
} from './types.js';

export function createPlaybackController(
  environment: EnvironmentAdapterAPI,
  timelineEngine: TimelineEngineAPI,
  scheduler: SchedulerAPI
): PlaybackControllerAPI {
  let state: PlaybackState = 'idle';
  let speed = 1;
  let reversed = false;
  let currentTime = 0;
  let lastTickTimestamp = 0;

  function tick(timestamp: number): void {
    if (state !== 'playing') return;

    if (lastTickTimestamp > 0) {
      const rawDelta = timestamp - lastTickTimestamp;
      const adjustedDelta = rawDelta * speed * (reversed ? -1 : 1);
      currentTime += adjustedDelta;
      if (currentTime < 0) currentTime = 0;
    }

    lastTickTimestamp = timestamp;
    timelineEngine.tick(currentTime);
  }

  return {
    play(): void {
      if (state === 'playing') return;
      state = 'playing';
      lastTickTimestamp = 0;
      scheduler.startLoop(tick);
    },

    pause(): void {
      if (state !== 'playing') return;
      state = 'paused';
      scheduler.stopLoop();
      timelineEngine.pauseAll();
    },

    resume(): void {
      if (state !== 'paused') return;
      state = 'playing';
      lastTickTimestamp = 0;
      timelineEngine.resumeAll();
      scheduler.startLoop(tick);
    },

    seek(timeMs: number): void {
      currentTime = Math.max(0, timeMs);
      // Snap to nearest frame boundary
      const frameInterval = 1000 / 60;
      currentTime = Math.round(currentTime / frameInterval) * frameInterval;
      timelineEngine.tick(currentTime);
    },

    reverse(): void {
      reversed = !reversed;
    },

    setSpeed(multiplier: number): void {
      speed = Math.max(0.01, multiplier);
    },

    get state() { return state; },
    get speed() { return speed; },
    get reversed() { return reversed; },
    get currentTime() { return currentTime; },

    destroy(): void {
      scheduler.stopLoop();
      state = 'idle';
      speed = 1;
      reversed = false;
      currentTime = 0;
      lastTickTimestamp = 0;
    },
  };
}
