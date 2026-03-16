import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import { Storage } from "../storage/asyncStorage";
import {
  registerBackgroundTask,
  unregisterBackgroundTask,
} from "../services/pollingScheduler";
import {
  startAndroidForegroundService,
  stopAndroidForegroundService,
} from "../services/foregroundService";
import {
  promptBatteryOptimizationIfNeeded,
  promptFullScreenIntentIfNeeded,
} from "../services/batteryOptimization";

const ANDROID_PACKAGE = "com.rajeshkanna.breakingnewsautoplayer";

export function useMonitor(channelCount: number, keyword: string) {
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    Storage.getIsMonitoring().then(setIsMonitoring);
  }, []);

  const enable = useCallback(async (): Promise<void> => {
    // MUST persist isMonitoring=true BEFORE starting the foreground service.
    // The service handler fires immediately on displayNotification and reads
    // isMonitoring from storage on its first iteration — if it's still false
    // at that point the loop breaks instantly and the service dies silently.
    await Storage.setIsMonitoring(true);
    setIsMonitoring(true);

    if (Platform.OS === "android") {
      await promptBatteryOptimizationIfNeeded(ANDROID_PACKAGE);
      await promptFullScreenIntentIfNeeded(ANDROID_PACKAGE);
      await startAndroidForegroundService(channelCount, keyword);
    }
    await registerBackgroundTask(channelCount);
  }, [channelCount, keyword]);

  const disable = useCallback(async (): Promise<void> => {
    if (Platform.OS === "android") {
      await stopAndroidForegroundService();
    }
    await unregisterBackgroundTask();
    await Storage.setIsMonitoring(false);
    setIsMonitoring(false);
  }, []);

  const toggle = useCallback(async (): Promise<void> => {
    if (isMonitoring) {
      await disable();
    } else {
      await enable();
    }
  }, [isMonitoring, enable, disable]);

  return { isMonitoring, enable, disable, toggle };
}
