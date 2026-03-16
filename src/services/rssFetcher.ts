import { XMLParser } from "fast-xml-parser";
import { YOUTUBE_RSS_BASE } from "../config/youtube";
import { RssEntry } from "../types";

const FETCH_TIMEOUT_MS = 12_000; // 12s — aborts if Android blocks network on lock screen

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

export async function fetchChannelFeed(channelId: string): Promise<RssEntry[]> {
  const url = `${YOUTUBE_RSS_BASE}${channelId}`;
  console.log("[BNA] RSS GET", url);

  const controller = new AbortController();
  const timer = setTimeout(() => {
    console.log("[BNA] RSS fetch timed out for", channelId);
    controller.abort();
  }, FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/xml, text/xml" },
      signal: controller.signal,
    });
    clearTimeout(timer);
    console.log("[BNA] RSS status:", res.status, "for channel:", channelId);
    if (!res.ok) return [];

    const xml = await res.text();
    const entries = parseRssFeed(xml);
    console.log("[BNA] RSS parsed", entries.length, "entries for channel:", channelId);
    entries.forEach(e => console.log("[BNA]  -", e.videoId, "|", e.title));
    return entries;
  } catch (e) {
    clearTimeout(timer);
    console.log("[BNA] RSS fetch error for", channelId, ":", e);
    return [];
  }
}

function parseRssFeed(xml: string): RssEntry[] {
  try {
    const parsed = parser.parse(xml);
    const entries = parsed?.feed?.entry;
    if (!entries) return [];

    const list = Array.isArray(entries) ? entries : [entries];
    return list
      .map((entry: Record<string, unknown>) => {
        const videoId = entry["yt:videoId"] as string | undefined;
        const title = (entry["title"] as string | undefined) ?? "";
        const published = (entry["published"] as string | undefined) ?? "";
        const channelId = entry["yt:channelId"] as string | undefined;

        if (!videoId || !channelId) return null;
        return { videoId, title, publishedAt: published, channelId } as RssEntry;
      })
      .filter((e): e is RssEntry => e !== null);
  } catch {
    return [];
  }
}
