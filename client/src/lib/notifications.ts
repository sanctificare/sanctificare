import { isMobileApp } from "@/const";
import {
  ANDROID_LOCAL_NOTIFICATION_OPTIONS,
  ensureAndroidNotificationChannel,
} from "./nativeNotifications";

// Fixed ids so scheduling/cancelling always targets the same reminders.
const DAILY_REMINDER_ID = 1001;
const ANGELUS_12_ID = 1002;
const ANGELUS_18_ID = 1003;
const NOVENA_REMINDER_ID = 1004;

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
    await ensureAndroidNotificationChannel();
    await LocalNotifications.cancel({
      notifications: [{ id: DAILY_REMINDER_ID }],
    });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: DAILY_REMINDER_ID,
          title: "Sanctificare",
          body: "Está na hora da sua oração diária. Mantenha viva a sua constância espiritual!",
          ...ANDROID_LOCAL_NOTIFICATION_OPTIONS,
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

/** Schedules Angelus daily repeating reminders (12h and 18h). */
export async function scheduleAngelusReminders(): Promise<void> {
  if (!isMobileApp()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await ensureAndroidNotificationChannel();
    await LocalNotifications.cancel({
      notifications: [{ id: ANGELUS_12_ID }, { id: ANGELUS_18_ID }],
    });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: ANGELUS_12_ID,
          title: "Ângelus — Sanctificare",
          body: "Hora do Ângelus. 'O Anjo do Senhor anunciou a Maria...' Una-se em oração com a encarnação de nosso Salvador.",
          ...ANDROID_LOCAL_NOTIFICATION_OPTIONS,
          schedule: {
            on: { hour: 12, minute: 0 },
            allowWhileIdle: true,
            repeats: true,
          },
        },
        {
          id: ANGELUS_18_ID,
          title: "Ângelus — Sanctificare",
          body: "Hora do Ângelus do entardecer. 'E o Verbo se fez carne e habitou entre nós...' Eleve seu coração a Nossa Senhora.",
          ...ANDROID_LOCAL_NOTIFICATION_OPTIONS,
          schedule: {
            on: { hour: 18, minute: 0 },
            allowWhileIdle: true,
            repeats: true,
          },
        },
      ],
    });
  } catch (err) {
    console.warn("[notifications] scheduleAngelus error:", err);
  }
}

/** Cancels Angelus daily reminders (12h and 18h). */
export async function cancelAngelusReminders(): Promise<void> {
  if (!isMobileApp()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({
      notifications: [{ id: ANGELUS_12_ID }, { id: ANGELUS_18_ID }],
    });
  } catch (err) {
    console.warn("[notifications] cancelAngelus error:", err);
  }
}

/** Schedules active Novena reminder at 20:00. */
export async function scheduleNovenaReminder(time: string = "20:00"): Promise<void> {
  if (!isMobileApp()) return;
  const { hour, minute } = parseTime(time);
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await ensureAndroidNotificationChannel();
    await LocalNotifications.cancel({
      notifications: [{ id: NOVENA_REMINDER_ID }],
    });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOVENA_REMINDER_ID,
          title: "Novena Ativa — Sanctificare",
          body: "Não se esqueça de rezar o dia de hoje da sua novena ativa! Mantenha a sua perseverança.",
          ...ANDROID_LOCAL_NOTIFICATION_OPTIONS,
          schedule: {
            on: { hour, minute },
            allowWhileIdle: true,
            repeats: true,
          },
        },
      ],
    });
  } catch (err) {
    console.warn("[notifications] scheduleNovena error:", err);
  }
}

/** Cancels active Novena reminder. */
export async function cancelNovenaReminder(): Promise<void> {
  if (!isMobileApp()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({
      notifications: [{ id: NOVENA_REMINDER_ID }],
    });
  } catch (err) {
    console.warn("[notifications] cancelNovena error:", err);
  }
}

