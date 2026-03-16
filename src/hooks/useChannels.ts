import { useState, useEffect, useCallback } from "react";
import { Channel } from "../types";
import { Storage } from "../storage/asyncStorage";
import { resolveChannel } from "../services/channelResolver";
import { MAX_CHANNELS } from "../constants";

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const saved = await Storage.getChannels();
    setChannels(saved);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addChannel = useCallback(
    async (input: string): Promise<void> => {
      if (channels.length >= MAX_CHANNELS) {
        throw new Error(`Maximum ${MAX_CHANNELS} channels allowed.`);
      }

      const resolved = await resolveChannel(input);

      if (channels.some((c) => c.id === resolved.channelId)) {
        throw new Error(`"${resolved.displayName}" is already in your list.`);
      }

      const newChannel: Channel = {
        id: resolved.channelId,
        handle: input.trim(),
        displayName: resolved.displayName,
        addedAt: Date.now(),
      };

      const updated = [...channels, newChannel];
      await Storage.setChannels(updated);
      setChannels(updated);
      // Reset rotation index when channel list changes
      await Storage.setNextChannelIndex(0);
    },
    [channels]
  );

  const removeChannel = useCallback(
    async (channelId: string): Promise<void> => {
      const updated = channels.filter((c) => c.id !== channelId);
      await Storage.setChannels(updated);
      setChannels(updated);
      await Storage.setNextChannelIndex(0);
    },
    [channels]
  );

  return { channels, loading, addChannel, removeChannel, reload };
}
