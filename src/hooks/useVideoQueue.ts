import { useState, useEffect, useCallback } from "react";
import { VideoEntry } from "../types";
import { Storage } from "../storage/asyncStorage";

export function useLastPlayed() {
  const [lastPlayed, setLastPlayed] = useState<VideoEntry | null>(null);

  const reload = useCallback(async () => {
    const video = await Storage.getLastPlayed();
    setLastPlayed(video);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const clearHistory = useCallback(async () => {
    await Storage.clearSeenVideoIds();
    await Storage.setLastPlayed({ videoId: "", title: "", channelId: "", channelName: "", publishedAt: "" });
    setLastPlayed(null);
  }, []);

  return { lastPlayed, clearHistory, reload };
}
