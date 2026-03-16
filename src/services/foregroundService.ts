/**
 * Android foreground service management via @notifee/react-native.
 *
 * A running foreground service:
 *  1. Keeps the JS thread and process alive when the app is backgrounded
 *  2. Grants permission to call startActivity (i.e. Linking.openURL) from background
 *  3. Shows a persistent notification in the status bar
 *
 * iOS: all functions are no-ops since iOS uses a different mechanism.
 */
import { Platform } from "react-native";
import notifee, { AndroidImportance } from "@notifee/react-native";
import { signalForegroundStop } from "./foregroundPolling";

const CHANNEL_ID = "bna-monitoring";
const NOTIFICATION_ID = "bna-foreground-service";

async function ensureChannel(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: "Background Monitoring",
    importance: AndroidImportance.LOW, // silent — no sound or vibration
    vibration: false,
  });
}

export async function startAndroidForegroundService(
  channelCount: number,
  keyword: string
): Promise<void> {
  if (Platform.OS !== "android") return;
  await ensureChannel();

  await notifee.displayNotification({
    id: NOTIFICATION_ID,
    title: "Breaking News Autoplayer",
    body:
      channelCount > 0 && keyword
        ? `Monitoring ${channelCount} channel${channelCount !== 1 ? "s" : ""} for "${keyword}"`
        : "Monitoring active",
    android: {
      channelId: CHANNEL_ID,
      asForegroundService: true,
      smallIcon: "ic_launcher",
      color: "#C62828",
      ongoing: true,          // user cannot dismiss it
      onlyAlertOnce: true,
      pressAction: { id: "default" },
    },
  });
}

export async function stopAndroidForegroundService(): Promise<void> {
  if (Platform.OS !== "android") return;
  // Signal the polling loop to exit, then stop the service
  signalForegroundStop();
  await notifee.stopForegroundService();
}

export async function updateForegroundNotification(
  channelCount: number,
  keyword: string
): Promise<void> {
  if (Platform.OS !== "android") return;
  await ensureChannel();

  await notifee.displayNotification({
    id: NOTIFICATION_ID,
    title: "Breaking News Autoplayer",
    body:
      channelCount > 0 && keyword
        ? `Monitoring ${channelCount} channel${channelCount !== 1 ? "s" : ""} for "${keyword}"`
        : "Monitoring active",
    android: {
      channelId: CHANNEL_ID,
      asForegroundService: true,
      smallIcon: "ic_launcher",
      color: "#C62828",
      ongoing: true,
      onlyAlertOnce: true,
      pressAction: { id: "default" },
    },
  });
}
