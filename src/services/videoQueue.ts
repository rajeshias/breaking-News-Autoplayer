import { Linking } from "react-native";
import { Channel, RssEntry, VideoEntry } from "../types";

export function matchesKeyword(title: string, keyword: string): boolean {
  if (!keyword.trim()) return false;
  return title.toLowerCase().includes(keyword.toLowerCase().trim());
}

/**
 * From the RSS entries, find the first (most recent) one that matches
 * the keyword and hasn't been seen before.
 */
export function findLatestMatch(
  entries: RssEntry[],
  keyword: string,
  seenVideoIds: string[],
  channel: Channel
): VideoEntry | null {
  const seenSet = new Set(seenVideoIds);
  const match = entries.find(
    (e) => matchesKeyword(e.title, keyword) && !seenSet.has(e.videoId)
  );
  if (!match) return null;
  return {
    videoId: match.videoId,
    title: match.title,
    channelId: channel.id,
    channelName: channel.displayName,
    publishedAt: match.publishedAt,
  };
}

/**
 * Opens a video in the YouTube app, falling back to browser.
 */
export async function openVideoInYouTube(videoId: string): Promise<void> {
  const appUrl = `youtube://www.youtube.com/watch?v=${videoId}`;
  const webUrl = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const supported = await Linking.canOpenURL(appUrl);
    await Linking.openURL(supported ? appUrl : webUrl);
  } catch {
    try {
      await Linking.openURL(webUrl);
    } catch {
      // Nothing we can do
    }
  }
}
