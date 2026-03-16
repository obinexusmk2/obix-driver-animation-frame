/**
 * Visibility-Aware Throttling + Background Tab Throttling
 * Auto pause/resume via Page Visibility API with configurable background FPS limits.
 */

import type { EnvironmentAdapterAPI, VisibilityConfig, VisibilityControllerAPI } from './types.js';

export function createVisibilityController(
  environment: EnvironmentAdapterAPI,
  config: VisibilityConfig = {}
): VisibilityControllerAPI {
  const backgroundFPS = config.backgroundFPS ?? 0;
  const autoPause = config.autoPause ?? true;
  const resumeDelay = config.resumeDelay ?? 0;

  let visible = true;
  let throttled = false;
  let resumeTimer: ReturnType<typeof setTimeout> | null = null;
  const callbacks: Array<(visible: boolean) => void> = [];

  function handleVisibilityChange(): void {
    const nowVisible = !globalThis.document.hidden;

    if (nowVisible === visible) return;

    if (nowVisible) {
      // Becoming visible
      if (resumeDelay > 0) {
        resumeTimer = globalThis.setTimeout(() => {
          resumeTimer = null;
          visible = true;
          throttled = false;
          for (const cb of callbacks) cb(true);
        }, resumeDelay);
      } else {
        visible = true;
        throttled = false;
        for (const cb of callbacks) cb(true);
      }
    } else {
      // Becoming hidden
      visible = false;
      throttled = autoPause || backgroundFPS > 0;
      if (resumeTimer !== null) {
        globalThis.clearTimeout(resumeTimer);
        resumeTimer = null;
      }
      for (const cb of callbacks) cb(false);
    }
  }

  // Attach listener if in browser
  if (environment.isBrowser && typeof globalThis.document?.addEventListener === 'function') {
    globalThis.document.addEventListener('visibilitychange', handleVisibilityChange);
    // Set initial state
    visible = !globalThis.document.hidden;
  }

  return {
    get isVisible() { return visible; },
    get isThrottled() { return throttled; },

    onVisibilityChange(callback): void {
      callbacks.push(callback);
    },

    removeVisibilityCallback(callback): void {
      const idx = callbacks.indexOf(callback);
      if (idx !== -1) callbacks.splice(idx, 1);
    },

    getEffectiveTargetFPS(baseFPS: number): number {
      if (visible) return baseFPS;
      if (backgroundFPS === 0) return 0;
      return Math.min(backgroundFPS, baseFPS);
    },

    destroy(): void {
      if (environment.isBrowser && typeof globalThis.document?.removeEventListener === 'function') {
        globalThis.document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (resumeTimer !== null) {
        globalThis.clearTimeout(resumeTimer);
        resumeTimer = null;
      }
      callbacks.length = 0;
    },
  };
}
