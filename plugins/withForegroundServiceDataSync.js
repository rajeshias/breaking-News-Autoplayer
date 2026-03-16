/**
 * Custom Expo config plugin that adds Android 14+ foreground service
 * data-sync permission and declares the service type in the manifest.
 *
 * Required because @notifee/react-native's built-in plugin doesn't add
 * FOREGROUND_SERVICE_DATA_SYNC (needed for Android API 34+).
 */
const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Ensures a <uses-permission> entry exists in the manifest.
 */
function addPermission(manifest, name) {
  if (!manifest["uses-permission"]) {
    manifest["uses-permission"] = [];
  }
  const exists = manifest["uses-permission"].some(
    (p) => p.$ && p.$["android:name"] === name
  );
  if (!exists) {
    manifest["uses-permission"].push({ $: { "android:name": name } });
  }
}

module.exports = function withForegroundServiceDataSync(config) {
  return withAndroidManifest(config, (modConfig) => {
    const androidManifest = modConfig.modResults.manifest;

    // Add FOREGROUND_SERVICE_DATA_SYNC permission (Android 14+)
    addPermission(androidManifest, "android.permission.FOREGROUND_SERVICE_DATA_SYNC");

    return modConfig;
  });
};
