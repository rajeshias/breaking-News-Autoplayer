/**
 * Config plugin that:
 *  1. Adds the notifee local Maven repository to android/build.gradle
 *  2. Adds FOREGROUND_SERVICE_DATA_SYNC permission for Android 14+
 *  3. Sets showWhenLocked + turnScreenOn on MainActivity so the screen
 *     wakes up when the fullScreenAction notification launches the app
 *     over the lock screen.
 */
const { withProjectBuildGradle, withAndroidManifest } = require("@expo/config-plugins");
const path = require("path");

const NOTIFEE_MAVEN_COMMENT = "// notifee local maven repo";

function addNotifeeRepo(buildGradle) {
  if (buildGradle.includes(NOTIFEE_MAVEN_COMMENT)) {
    return buildGradle; // already added
  }

  const notifeeLibsPath = path.resolve(
    __dirname,
    "../node_modules/@notifee/react-native/android/libs"
  );

  const mavenBlock = `        ${NOTIFEE_MAVEN_COMMENT}
        maven { url '${notifeeLibsPath}' }`;

  // Insert before the closing brace of allprojects { repositories { ... } }
  return buildGradle.replace(
    /allprojects\s*\{\s*repositories\s*\{/,
    `allprojects {\n  repositories {`
  ).replace(
    /(allprojects\s*\{[\s\S]*?repositories\s*\{[\s\S]*?)(}\s*})/,
    (match, inner, closing) => `${inner}${mavenBlock}\n    ${closing}`
  );
}

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

module.exports = function withNotifeeAndroid(config) {
  // Step 1: Add notifee Maven repo to android/build.gradle
  config = withProjectBuildGradle(config, (modConfig) => {
    modConfig.modResults.contents = addNotifeeRepo(modConfig.modResults.contents);
    return modConfig;
  });

  // Step 2: Manifest changes
  config = withAndroidManifest(config, (modConfig) => {
    const androidManifest = modConfig.modResults.manifest;

    // Add FOREGROUND_SERVICE_DATA_SYNC permission for Android 14+
    addPermission(
      androidManifest,
      "android.permission.FOREGROUND_SERVICE_DATA_SYNC"
    );

    // Set showWhenLocked + turnScreenOn on MainActivity.
    // This makes the activity appear over the lock screen and turns the
    // screen on when launched by the fullScreenAction notification.
    const application = androidManifest.application?.[0];
    if (application?.activity) {
      const mainActivity = application.activity.find(
        (a) =>
          a.$?.["android:name"] === ".MainActivity" ||
          a.$?.["android:name"]?.endsWith("MainActivity")
      );
      if (mainActivity) {
        mainActivity.$["android:showWhenLocked"] = "true";
        mainActivity.$["android:turnScreenOn"] = "true";
      }
    }

    return modConfig;
  });

  return config;
};
