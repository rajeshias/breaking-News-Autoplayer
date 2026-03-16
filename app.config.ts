import "dotenv/config";

export default {
  expo: {
    name: "Breaking News Autoplayer",
    slug: "breaking-news-autoplayer",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    extra: {
      youtubeApiKey: process.env.YOUTUBE_API_KEY ?? "",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.rajeshkanna.breakingnewsautoplayer",
      infoPlist: {
        UIBackgroundModes: ["fetch"],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
      },
      package: "com.rajeshkanna.breakingnewsautoplayer",
      permissions: [
        "RECEIVE_BOOT_COMPLETED",
        "FOREGROUND_SERVICE",
        "WAKE_LOCK",
        "USE_FULL_SCREEN_INTENT",
        "VIBRATE",
        "REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
      ],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#C62828",
          sounds: [],
        },
      ],
      "expo-background-fetch",
      "expo-task-manager",
      // Adds notifee Maven repo to build.gradle + FOREGROUND_SERVICE_DATA_SYNC permission
      "./plugins/withNotifeeAndroid",
    ],
  },
};
