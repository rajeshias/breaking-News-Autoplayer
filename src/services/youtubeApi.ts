import { YOUTUBE_API_KEY, YOUTUBE_API_BASE } from "../config/youtube";

/**
 * Parses ISO 8601 duration strings like PT4M33S, PT1H2M3S, PT45S
 */
export function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);
  const seconds = parseInt(match[3] ?? "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Fetches video durations in seconds for a list of video IDs.
 * YouTube API allows up to 50 IDs per request.
 * Returns a Map<videoId, durationSeconds>.
 */
export async function getVideoDurations(
  videoIds: string[]
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (!videoIds.length || !YOUTUBE_API_KEY) return result;

  // Batch in chunks of 50
  const chunks: string[][] = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    chunks.push(videoIds.slice(i, i + 50));
  }

  for (const chunk of chunks) {
    try {
      const ids = chunk.join(",");
      const url = `${YOUTUBE_API_BASE}/videos?part=contentDetails&id=${ids}&key=${YOUTUBE_API_KEY}`;
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 12_000);
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) continue;
      const data = await res.json();
      for (const item of data?.items ?? []) {
        const duration = parseDuration(item.contentDetails?.duration ?? "");
        result.set(item.id, duration);
      }
    } catch {
      // Continue with remaining chunks
    }
  }

  return result;
}
