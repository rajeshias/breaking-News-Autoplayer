export interface Channel {
  id: string;          // YouTube channel ID (UCxxxxx...)
  handle: string;      // User-entered handle/username
  displayName: string; // Fetched from API
  addedAt: number;     // Unix timestamp ms
}

export interface VideoEntry {
  videoId: string;
  title: string;
  channelId: string;
  channelName: string;
  publishedAt: string; // ISO string
}

export interface RssEntry {
  videoId: string;
  title: string;
  publishedAt: string;
  channelId: string;
}
