import { isMobileApp } from "@/const";

export const ANDROID_NOTIFICATION_CHANNEL_ID = "sanctificare_general";
export const ANDROID_NOTIFICATION_ICON = "ic_stat_sanctificare";
export const ANDROID_NOTIFICATION_COLOR = "#C8A04D";

export const ANDROID_LOCAL_NOTIFICATION_OPTIONS = {
  channelId: ANDROID_NOTIFICATION_CHANNEL_ID,
  smallIcon: ANDROID_NOTIFICATION_ICON,
  iconColor: ANDROID_NOTIFICATION_COLOR,
} as const;

export async function ensureAndroidNotificationChannel(): Promise<void> {
  if (!isMobileApp()) return;

  try {
    const [{ Capacitor }, { PushNotifications }, { LocalNotifications }] = await Promise.all([
      import("@capacitor/core"),
      import("@capacitor/push-notifications"),
      import("@capacitor/local-notifications"),
    ]);

    if (Capacitor.getPlatform() !== "android") {
      return;
    }

    const channel = {
      id: ANDROID_NOTIFICATION_CHANNEL_ID,
      name: "Sanctificare",
      description: "Orações, lembretes e notificações do app.",
      importance: 4,
      visibility: 1,
      vibration: true,
    } as const;

    await Promise.allSettled([
      PushNotifications.createChannel(channel),
      LocalNotifications.createChannel(channel),
    ]);
  } catch (err) {
    console.warn("[notifications] failed to ensure Android channel:", err);
  }
}