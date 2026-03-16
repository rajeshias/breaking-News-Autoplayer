import Constants from "expo-constants";

export const YOUTUBE_API_KEY: string =
  (Constants.expoConfig?.extra?.youtubeApiKey as string) ?? "";

export const YOUTUBE_RSS_BASE =
  "https://www.youtube.com/feeds/videos.xml?channel_id=";

export const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
