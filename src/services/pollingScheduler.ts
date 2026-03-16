import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { BACKGROUND_TASK_NAME, POLL_CYCLE_MINUTES } from "../constants";

/**
 * Calculates the background fetch interval in seconds for N channels.
 * Each channel gets polled once per 5-minute cycle.
 */
export function getIntervalSeconds(numChannels: number): number {
  const n = Math.max(numChannels, 1);
  return Math.floor((POLL_CYCLE_MINUTES * 60) / n);
}

/**
 * Registers (or re-registers) the background poll task with the correct interval.
 * Call this whenever the channel list changes or monitoring is toggled on.
 */
export async function registerBackgroundTask(numChannels: number): Promise<void> {
  const intervalSeconds = getIntervalSeconds(numChannels);
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);

  if (isRegistered) {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME);
  }

  await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
    minimumInterval: intervalSeconds,
    stopOnTerminate: false, // Android: keep running after app is killed
    startOnBoot: true,      // Android: restart after device reboot
  });
}

/**
 * Unregisters the background task. Call when monitoring is toggled off.
 */
export async function unregisterBackgroundTask(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
  if (isRegistered) {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME);
  }
}

export async function isTaskRegistered(): Promise<boolean> {
  return TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
}
