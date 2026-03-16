import { YOUTUBE_API_KEY, YOUTUBE_API_BASE } from "../config/youtube";

export interface ResolvedChannel {
  channelId: string;
  displayName: string;
}

/**
 * Converts a user-entered handle/username/channel-ID to a YouTube channel ID.
 * Handles three input formats:
 *   - Raw channel ID already (starts with "UC") → skip API call
 *   - @handle (modern channels) → channels.list?forHandle
 *   - username (legacy) → channels.list?forUsername → fallback search.list
 */
export async function resolveChannel(input: string): Promise<ResolvedChannel> {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Please enter a channel handle or ID.");
  console.log("[BNA] resolveChannel input:", trimmed);

  // Already a channel ID
  if (trimmed.startsWith("UC") && trimmed.length > 20) {
    const name = await fetchChannelName(trimmed);
    return { channelId: trimmed, displayName: name };
  }

  const handle = trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
  const rawHandle = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;

  // Attempt 1: channels.list?forHandle=@handle  (modern @username channels)
  try {
    const result = await fetchByForHandle(handle);
    if (result) return result;
  } catch {
    // fall through
  }

  // Attempt 2: channels.list?forUsername=username  (legacy username-based channels)
  try {
    const result = await fetchByForUsername(rawHandle);
    if (result) return result;
  } catch {
    // fall through
  }

  // Attempt 3: search.list (expensive fallback)
  try {
    const result = await fetchBySearch(rawHandle);
    if (result) return result;
  } catch {
    // fall through
  }

  throw new Error(
    `Could not find a YouTube channel for "${trimmed}". Check the handle and try again.`
  );
}

async function fetchByForHandle(handle: string): Promise<ResolvedChannel | null> {
  const url = `${YOUTUBE_API_BASE}/channels?part=snippet&forHandle=${encodeURIComponent(handle)}&key=${YOUTUBE_API_KEY}`;
  console.log("[BNA] GET", url.replace(YOUTUBE_API_KEY, "***"));
  const res = await fetch(url);
  console.log("[BNA] forHandle status:", res.status);
  if (!res.ok) return null;
  const data = await res.json();
  const item = data?.items?.[0];
  if (!item) { console.log("[BNA] forHandle: no items"); return null; }
  console.log("[BNA] forHandle resolved:", item.id, item.snippet.title);
  return { channelId: item.id, displayName: item.snippet.title };
}

async function fetchByForUsername(username: string): Promise<ResolvedChannel | null> {
  const url = `${YOUTUBE_API_BASE}/channels?part=snippet&forUsername=${encodeURIComponent(username)}&key=${YOUTUBE_API_KEY}`;
  console.log("[BNA] GET", url.replace(YOUTUBE_API_KEY, "***"));
  const res = await fetch(url);
  console.log("[BNA] forUsername status:", res.status);
  if (!res.ok) return null;
  const data = await res.json();
  const item = data?.items?.[0];
  if (!item) { console.log("[BNA] forUsername: no items"); return null; }
  console.log("[BNA] forUsername resolved:", item.id, item.snippet.title);
  return { channelId: item.id, displayName: item.snippet.title };
}

async function fetchBySearch(query: string): Promise<ResolvedChannel | null> {
  const url = `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=1&key=${YOUTUBE_API_KEY}`;
  console.log("[BNA] GET (search fallback)", url.replace(YOUTUBE_API_KEY, "***"));
  const res = await fetch(url);
  console.log("[BNA] search status:", res.status);
  if (!res.ok) return null;
  const data = await res.json();
  const item = data?.items?.[0];
  if (!item) { console.log("[BNA] search: no items"); return null; }
  console.log("[BNA] search resolved:", item.snippet.channelId, item.snippet.channelTitle);
  return {
    channelId: item.snippet.channelId,
    displayName: item.snippet.channelTitle,
  };
}

async function fetchChannelName(channelId: string): Promise<string> {
  try {
    const url = `${YOUTUBE_API_BASE}/channels?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    console.log("[BNA] GET", url.replace(YOUTUBE_API_KEY, "***"));
    const res = await fetch(url);
    if (!res.ok) return channelId;
    const data = await res.json();
    return data?.items?.[0]?.snippet?.title ?? channelId;
  } catch {
    return channelId;
  }
}
