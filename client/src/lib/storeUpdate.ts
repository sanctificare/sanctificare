import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import {
  AppUpdate,
  AppUpdateAvailability,
  FlexibleUpdateInstallStatus,
} from "@capawesome/capacitor-app-update";

// Google Play In-App Updates for native (APK/AAB) releases. Web-only changes
// reach users through OTA; this covers releases that must go through the store.

// After this many days on an outdated version the update becomes mandatory.
const IMMEDIATE_UPDATE_STALENESS_DAYS = 7;
// Don't ask again for a flexible update the user dismissed within this window.
const FLEXIBLE_PROMPT_INTERVAL_MS = 24 * 60 * 60 * 1000;
const LAST_PROMPT_KEY = "sanctificare_store_update_prompted_at";

let isChecking = false;
let isAppInBackground = false;
let isUpdateDownloaded = false;
let listenersReady = false;

async function completeDownloadedUpdate() {
  try {
    // In the background Play installs silently and restarts the app.
    await AppUpdate.completeFlexibleUpdate();
  } catch (error) {
    console.warn("[StoreUpdate] Could not complete flexible update:", error);
  }
}

function setupListeners() {
  if (listenersReady) return;
  listenersReady = true;

  void AppUpdate.addListener("onFlexibleUpdateStateChange", (state) => {
    if (state.installStatus !== FlexibleUpdateInstallStatus.DOWNLOADED) return;
    isUpdateDownloaded = true;
    if (isAppInBackground) void completeDownloadedUpdate();
  });

  void CapApp.addListener("pause", () => {
    isAppInBackground = true;
    if (isUpdateDownloaded) void completeDownloadedUpdate();
  });
  void CapApp.addListener("resume", () => {
    isAppInBackground = false;
  });
}

function readLastPrompt(): number {
  try {
    return Number(localStorage.getItem(LAST_PROMPT_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeLastPrompt() {
  try {
    localStorage.setItem(LAST_PROMPT_KEY, String(Date.now()));
  } catch {
    // Storage unavailable: the user may just be asked again next time.
  }
}

export async function checkForStoreUpdate() {
  if (Capacitor.getPlatform() !== "android" || isChecking) return;
  isChecking = true;

  try {
    setupListeners();
    const info = await AppUpdate.getAppUpdateInfo();

    if (info.installStatus === FlexibleUpdateInstallStatus.DOWNLOADED) {
      isUpdateDownloaded = true;
      return;
    }
    if (info.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) return;

    const staleDays = info.clientVersionStalenessDays ?? 0;
    if (info.immediateUpdateAllowed && staleDays >= IMMEDIATE_UPDATE_STALENESS_DAYS) {
      await AppUpdate.performImmediateUpdate();
      return;
    }

    if (info.flexibleUpdateAllowed && Date.now() - readLastPrompt() >= FLEXIBLE_PROMPT_INTERVAL_MS) {
      writeLastPrompt();
      await AppUpdate.startFlexibleUpdate();
    }
  } catch (error) {
    // Expected on sideloaded builds and devices without Google Play.
    console.warn("[StoreUpdate] In-app update check failed:", error);
  } finally {
    isChecking = false;
  }
}
