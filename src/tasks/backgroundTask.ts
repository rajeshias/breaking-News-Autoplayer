/**
 * IMPORTANT: This file must be imported at the very top of index.ts,
 * before registerRootComponent. This is required by expo-task-manager
 * so the task definition is registered before the JS runtime is ready.
 */
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import { BACKGROUND_TASK_NAME } from "../constants";
import { runPollCycle } from "../services/pollCycle";

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    const newData = await runPollCycle();
    return newData
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
