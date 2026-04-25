export const FLOW_COOLDOWN_MS = 3_000;
export const MIN_FLOW_DURATION_SECONDS = 60;

export const MUSICKIT_LOAD_TIMEOUT_MS = 10_000;
export const APPLE_MUSIC_TOKEN_EXPIRY_SECONDS = 15_777_000; // ~6 months
export const MUSICKIT_PLAYLIST_LIMIT = 100;

export const HEATMAP_DAYS = 98;
export const RECENT_RECORDS_LIMIT = 30;

export const MAX_DISPLAY_NAME_LENGTH = 30;
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

export const HEATMAP_LEVEL_THRESHOLDS = {
  LOW: 30 * 60,
  MEDIUM: 60 * 60,
  HIGH: 120 * 60,
} as const;
