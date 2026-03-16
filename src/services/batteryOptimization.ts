/**
 * Battery Optimization Exemption
 *
 * Android's Doze mode blocks all network access when the screen is off,
 * even for foreground services. Apps with emergency/safety purposes must
 * request exemption so the OS never restricts their network or CPU.
 *
 * This is the same mechanism used by tsunami warning, earthquake alert,
 * and emergency broadcast apps.
 */
import { Platform, Alert } from "react-native";
import * as IntentLauncher from "expo-intent-launcher";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PROMPTED_KEY = "@bna/batteryOptPrompted";
const FSI_PROMPTED_KEY = "@bna/fullScreenIntentPrompted";

/**
 * Opens the Android system dialog that asks:
 * "Allow Breaking News Autoplayer to always run in background?"
 *
 * This directly targets our app's package so the user just taps "Allow".
 * Once granted, Android will never throttle our network or CPU in the background.
 */
export async function requestBatteryOptimizationExemption(
  packageName: string
): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    await IntentLauncher.startActivityAsync(
      "android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
      { data: `package:${packageName}` }
    );
  } catch {
    // Fallback: open general battery optimization list
    try {
      await IntentLauncher.startActivityAsync(
        "android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS"
      );
    } catch {
      // Settings not available on this device
    }
  }
}

/**
 * On Android 14+, USE_FULL_SCREEN_INTENT is a special permission that must
 * be explicitly granted by the user in settings (like MANAGE_EXACT_ALARM).
 * Without it, fullScreenAction notifications cannot wake the screen.
 *
 * Only prompts once.
 */
export async function promptFullScreenIntentIfNeeded(
  packageName: string
): Promise<void> {
  if (Platform.OS !== "android") return;

  const alreadyPrompted = await AsyncStorage.getItem(FSI_PROMPTED_KEY);
  if (alreadyPrompted) return;

  await AsyncStorage.setItem(FSI_PROMPTED_KEY, "true");

  Alert.alert(
    "Allow Lock Screen Alerts",
    "To auto-play breaking news videos when your screen is locked, this app needs permission to show full-screen alerts (like an incoming call).\n\nOn the next screen, enable \"Allow full-screen intents\" for this app.",
    [
      { text: "Skip", style: "cancel" },
      {
        text: "Open settings",
        onPress: () => {
          try {
            IntentLauncher.startActivityAsync(
              "android.settings.MANAGE_APP_USE_FULL_SCREEN_INTENT",
              { data: `package:${packageName}` }
            );
          } catch {
            // Pre-Android 14 devices don't have this settings screen — permission is auto-granted
          }
        },
      },
    ],
    { cancelable: false }
  );
}

/**
 * Shows an explanation alert then opens the system exemption dialog.
 * Only prompts once unless forced.
 */
export async function promptBatteryOptimizationIfNeeded(
  packageName: string,
  force = false
): Promise<void> {
  if (Platform.OS !== "android") return;

  const alreadyPrompted = await AsyncStorage.getItem(PROMPTED_KEY);
  if (alreadyPrompted && !force) return;

  await AsyncStorage.setItem(PROMPTED_KEY, "true");

  Alert.alert(
    "Allow Unrestricted Background Access",
    "This app monitors for emergency news and must work even when your screen is off.\n\nOn the next screen, tap \"Allow\" to disable battery optimization for this app. Without this, Android may block network requests when the screen is locked.",
    [
      {
        text: "Skip (not recommended)",
        style: "cancel",
      },
      {
        text: "Allow — open settings",
        onPress: () => requestBatteryOptimizationExemption(packageName),
      },
    ],
    { cancelable: false }
  );
}
