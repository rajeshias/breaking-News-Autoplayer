import notifee, {
  AndroidImportance,
  AndroidVisibility,
} from "@notifee/react-native";
import { Platform } from "react-native";

const ALERT_CHANNEL_ID = "bna-breaking-alerts";

async function ensureAlertChannel(): Promise<void> {
  await notifee.createChannel({
    id: ALERT_CHANNEL_ID,
    name: "Breaking News Alerts",
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC, // show content on lock screen
    vibration: true,
    sound: "default",
  });
}

/**
 * Fires a HIGH-priority notification with fullScreenAction.
 *
 * On Android, when the screen is locked this wakes the device and launches
 * our MainActivity via the full-screen intent (same mechanism as incoming
 * call apps). App.tsx reads the pending video from AsyncStorage and
 * immediately calls Linking.openURL to open YouTube in the foreground.
 *
 * USE_FULL_SCREEN_INTENT must be granted on Android 14+. The user is
 * prompted to enable it in batteryOptimization prompts.
 */
export async function sendBreakingAlert(title: string): Promise<void> {
  if (Platform.OS !== "android") return;
  await ensureAlertChannel();
  await notifee.displayNotification({
    title: "🚨 Breaking News",
    body: title,
    android: {
      channelId: ALERT_CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      smallIcon: "ic_launcher",
      color: "#C62828",
      // Wakes screen + launches MainActivity over lock screen.
      fullScreenAction: {
        id: "default",
      },
      pressAction: {
        id: "default",
      },
    },
  });
}
