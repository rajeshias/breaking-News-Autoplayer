/**
 * Foreground service polling loop.
 *
 * Called by notifee.registerForegroundService() in index.ts.
 * Runs continuously while the Android foreground service is alive.
 * Because a foreground service is running, Android permits startActivity
 * calls (i.e. Linking.openURL to open YouTube) even from the background.
 */
import { Storage } from "../storage/asyncStorage";
import { runPollCycle } from "./pollCycle";
import { getIntervalSeconds } from "./pollingScheduler";

let _shouldStop = false;

export function signalForegroundStop(): void {
  _shouldStop = true;
}

export function resetForegroundStopSignal(): void {
  _shouldStop = false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Waits for `totalMs` milliseconds but checks the stop signal every 3 seconds
 * so the loop can exit promptly when monitoring is turned off.
 */
async function sleepInterruptible(totalMs: number): Promise<void> {
  const CHUNK_MS = 3_000;
  let elapsed = 0;
  while (elapsed < totalMs && !_shouldStop) {
    await sleep(Math.min(CHUNK_MS, totalMs - elapsed));
    elapsed += CHUNK_MS;
  }
}

/**
 * Main polling loop. Returns a Promise that resolves when the loop exits
 * (either because monitoring was turned off or signalForegroundStop was called).
 *
 * Pass this directly to notifee.registerForegroundService().
 */
export async function startForegroundPollingLoop(): Promise<void> {
  _shouldStop = false;

  while (!_shouldStop) {
    try {
      const [channels, isMonitoring] = await Promise.all([
        Storage.getChannels(),
        Storage.getIsMonitoring(),
      ]);

      if (!isMonitoring || channels.length === 0) {
        break;
      }

      await runPollCycle();

      const intervalMs = getIntervalSeconds(channels.length) * 1_000;
      await sleepInterruptible(intervalMs);
    } catch {
      // Never crash the loop — wait 10 s and retry
      await sleepInterruptible(10_000);
    }
  }
}
