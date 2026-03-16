/**
 * Playback Control API
 * Full transport controls: play, pause, resume, seek, reverse, speed.
 */
import type { EnvironmentAdapterAPI, PlaybackControllerAPI, SchedulerAPI, TimelineEngineAPI } from './types.js';
export declare function createPlaybackController(environment: EnvironmentAdapterAPI, timelineEngine: TimelineEngineAPI, scheduler: SchedulerAPI): PlaybackControllerAPI;
//# sourceMappingURL=playback-controller.d.ts.map