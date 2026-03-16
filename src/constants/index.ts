export const MAX_CHANNELS = 5;
export const POLL_CYCLE_MINUTES = 1;
export const BACKGROUND_TASK_NAME = "BREAKING_NEWS_POLL_TASK";
export const SEEN_VIDEO_IDS_CAP = 500;

export const STORAGE_KEYS = {
  CHANNELS: "@bna/channels",
  KEYWORD: "@bna/keyword",
  IS_MONITORING: "@bna/isMonitoring",
  SEEN_VIDEO_IDS: "@bna/seenVideoIds",
  LAST_PLAYED: "@bna/lastPlayed",
  NEXT_CHANNEL_INDEX: "@bna/nextChannelIndex",
  PENDING_VIDEO: "@bna/pendingVideo",
} as const;
