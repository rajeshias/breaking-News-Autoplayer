import { Platform } from "react-native";
import { Storage } from "../storage/asyncStorage";
import { fetchChannelFeed } from "./rssFetcher";
import { findLatestMatch, openVideoInYouTube } from "./videoQueue";
import { sendBreakingAlert } from "../notifications/notificationService";

export async function runPollCycle(): Promise<boolean> {
  const [channels, keyword, isMonitoring, nextIndex] = await Promise.all([
    Storage.getChannels(),
    Storage.getKeyword(),
    Storage.getIsMonitoring(),
    Storage.getNextChannelIndex(),
  ]);

  if (!isMonitoring || channels.length === 0) return false;

  const safeIndex = nextIndex % channels.length;
  const channel = channels[safeIndex];

  console.log(`[BNA] Poll cycle — channel[${safeIndex}]: "${channel.displayName}" | keyword: "${keyword}"`);

  // --- Poll the current channel ---
  const entries = await fetchChannelFeed(channel.id);
  let played = false;

  if (entries.length > 0 && keyword.trim()) {
    const seenVideoIds = await Storage.getSeenVideoIds();
    console.log(`[BNA] seenVideoIds (${seenVideoIds.length}):`, seenVideoIds.slice(-5));
    const match = findLatestMatch(entries, keyword, seenVideoIds, channel);

    if (match) {
      console.log(`[BNA] MATCH found: ${match.videoId} | "${match.title}"`);

      if (Platform.OS === "android") {
        // Android 10+: cannot start activities (open YouTube) directly from
        // a background service. Instead, save the pending video to storage
        // and fire a fullScreenAction notification. This wakes the screen and
        // launches our MainActivity, which then reads the pending video and
        // calls Linking.openURL in the foreground.
        await Storage.setPendingVideo(match.videoId, match.title);
        console.log(`[BNA] Saved pending video, firing full-screen alert`);
        await sendBreakingAlert(match.title);
      } else {
        // iOS: open directly (works in foreground; lock screen requires notification tap)
        await openVideoInYouTube(match.videoId);
      }

      await Storage.addSeenVideoIds([match.videoId]);
      await Storage.setLastPlayed(match);
      played = true;
    } else {
      console.log(`[BNA] No new matches for "${keyword}"`);
    }
  }

  // --- Advance to next channel ---
  const nextChannelIndex = (safeIndex + 1) % channels.length;
  await Storage.setNextChannelIndex(nextChannelIndex);

  return played;
}
