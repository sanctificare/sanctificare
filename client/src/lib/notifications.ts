import { isMobileApp } from "@/const";

// Fixed id so scheduling/cancelling always targets the same reminder.
const DAILY_REMINDER_ID = 1001;

function parseTime(time: string): { hour: number; minute: number } {
  const [hoursStr, minutesStr] = (time || "18:00").split(":");
  const hour = Number(hoursStr);
  const minute = Number(minutesStr);
  return {
    hour: Number.isFinite(hour) ? hour : 18,
    minute: Number.isFinite(minute) ? minute : 0,
  };
}

/**
 * Requests notification permission. Uses native LocalNotifications on Capacitor
 * (Android/iOS) and the Web Notifications API on the browser.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (isMobileApp()) {
    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const status = await LocalNotifications.checkPermissions();
      if (status.display === "granted") return true;
      const requested = await LocalNotifications.requestPermissions();
      return requested.display === "granted";
    } catch (err) {
      console.warn("[notifications] native permission error:", err);
      return false;
    }
  }

  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

/**
 * Schedules a repeating daily reminder at the given HH:MM time. Native only;
 * on the web the in-app interval fallback handles reminders while the app is
 * open, so this is a no-op there.
 */
export async function scheduleDailyReminder(time: string): Promise<void> {
  if (!isMobileApp()) return;

  const { hour, minute } = parseTime(time);
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({
      notifications: [{ id: DAILY_REMINDER_ID }],
    });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: DAILY_REMINDER_ID,
          title: "Sanctificare",
          body: "Está na hora da sua oração diária. Mantenha viva a sua constância espiritual!",
          schedule: {
            on: { hour, minute },
            allowWhileIdle: true,
            repeats: true,
          },
        },
      ],
    });
  } catch (err) {
    console.warn("[notifications] schedule error:", err);
  }
}

/** Cancels the scheduled daily reminder (native only). */
export async function cancelDailyReminder(): Promise<void> {
  if (!isMobileApp()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({
      notifications: [{ id: DAILY_REMINDER_ID }],
    });
  } catch (err) {
    console.warn("[notifications] cancel error:", err);
  }
}
