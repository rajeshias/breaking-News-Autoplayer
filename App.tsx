// CRITICAL: backgroundTask must be the VERY FIRST import so TaskManager
// can register the task definition before the React tree mounts.
import "./src/tasks/backgroundTask";

import React, { useEffect, useRef } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import notifee, { EventType } from "@notifee/react-native";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { openVideoInYouTube } from "./src/services/videoQueue";
import { Storage } from "./src/storage/asyncStorage";

/**
 * Checks AsyncStorage for a pending video queued by the background polling
 * service and opens it in YouTube, then clears the pending entry.
 *
 * This is the mechanism for Android lock-screen autoplay:
 *   poll cycle → setPendingVideo → fullScreenAction notification
 *   → MainActivity wakes → checkAndOpenPending → Linking.openURL(youtube://)
 */
async function checkAndOpenPending(): Promise<void> {
  const pending = await Storage.getPendingVideo();
  if (!pending) return;
  console.log(`[BNA] App foregrounded — opening pending video: ${pending.videoId}`);
  await Storage.clearPendingVideo();
  await openVideoInYouTube(pending.videoId);
}

export default function App() {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // Check immediately on mount (app launched by fullScreenAction intent)
    if (Platform.OS === "android") {
      checkAndOpenPending();
    }

    // Check whenever app comes back to foreground (from lock screen notification)
    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (
        Platform.OS === "android" &&
        appState.current !== "active" &&
        nextState === "active"
      ) {
        checkAndOpenPending();
      }
      appState.current = nextState;
    });

    // Handle notifee notification press (user taps notification banner)
    const notifeeUnsub = notifee.onForegroundEvent(({ type }) => {
      if (
        Platform.OS === "android" &&
        (type === EventType.PRESS || type === EventType.DELIVERED)
      ) {
        checkAndOpenPending();
      }
    });

    return () => {
      appStateSub.remove();
      notifeeUnsub();
    };
  }, []);

  return <AppNavigator />;
}
