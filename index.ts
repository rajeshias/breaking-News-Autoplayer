// Order matters — task definitions must be registered before the component tree.

// 1. Background fetch task (expo-task-manager)
import "./src/tasks/backgroundTask";

// 2. Notifee foreground service handler (Android)
//    Must be registered BEFORE registerRootComponent and BEFORE any
//    notifee.displayNotification call that uses asForegroundService: true.
import notifee from "@notifee/react-native";
import { startForegroundPollingLoop } from "./src/services/foregroundPolling";

notifee.registerForegroundService(() => {
  // This promise represents the service lifetime.
  // When it resolves, the foreground service stops.
  return startForegroundPollingLoop();
});

// 3. Mount the React app
import { registerRootComponent } from "expo";
import App from "./App";

registerRootComponent(App);
