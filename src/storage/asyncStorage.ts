import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, SEEN_VIDEO_IDS_CAP } from "../constants";
import { Channel, VideoEntry } from "../types";

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const Storage = {
  getChannels: (): Promise<Channel[]> =>
    getJSON<Channel[]>(STORAGE_KEYS.CHANNELS, []),

  setChannels: (channels: Channel[]): Promise<void> =>
    setJSON(STORAGE_KEYS.CHANNELS, channels),

  getKeyword: async (): Promise<string> => {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.KEYWORD);
    return val ?? "";
  },

  setKeyword: (keyword: string): Promise<void> =>
    AsyncStorage.setItem(STORAGE_KEYS.KEYWORD, keyword),

  getIsMonitoring: (): Promise<boolean> =>
    getJSON<boolean>(STORAGE_KEYS.IS_MONITORING, false),

  setIsMonitoring: (val: boolean): Promise<void> =>
    setJSON(STORAGE_KEYS.IS_MONITORING, val),

  getSeenVideoIds: (): Promise<string[]> =>
    getJSON<string[]>(STORAGE_KEYS.SEEN_VIDEO_IDS, []),

  addSeenVideoIds: async (newIds: string[]): Promise<void> => {
    const existing = await Storage.getSeenVideoIds();
    const merged = [...new Set([...existing, ...newIds])];
    const capped = merged.slice(-SEEN_VIDEO_IDS_CAP);
    await setJSON(STORAGE_KEYS.SEEN_VIDEO_IDS, capped);
  },

  clearSeenVideoIds: (): Promise<void> =>
    setJSON(STORAGE_KEYS.SEEN_VIDEO_IDS, []),

  getLastPlayed: (): Promise<VideoEntry | null> =>
    getJSON<VideoEntry | null>(STORAGE_KEYS.LAST_PLAYED, null),

  setLastPlayed: (video: VideoEntry): Promise<void> =>
    setJSON(STORAGE_KEYS.LAST_PLAYED, video),

  getNextChannelIndex: (): Promise<number> =>
    getJSON<number>(STORAGE_KEYS.NEXT_CHANNEL_INDEX, 0),

  setNextChannelIndex: (index: number): Promise<void> =>
    setJSON(STORAGE_KEYS.NEXT_CHANNEL_INDEX, index),

  getPendingVideo: (): Promise<{ videoId: string; title: string } | null> =>
    getJSON<{ videoId: string; title: string } | null>(STORAGE_KEYS.PENDING_VIDEO, null),

  setPendingVideo: (videoId: string, title: string): Promise<void> =>
    setJSON(STORAGE_KEYS.PENDING_VIDEO, { videoId, title }),

  clearPendingVideo: (): Promise<void> =>
    AsyncStorage.removeItem(STORAGE_KEYS.PENDING_VIDEO),

  clearAll: (): Promise<void[]> =>
    Promise.all(
      Object.values(STORAGE_KEYS).map((key) => AsyncStorage.removeItem(key))
    ),
};
