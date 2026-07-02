import { isMobileApp } from "@/const";

type InitPushParams = {
  onRegistered: (token: string, meta: { platform: "android" | "ios" | "web"; deviceId?: string | null }) => Promise<void>;
};

const TOKEN_STORAGE_KEY = "sanctificare.push.token";

function mapPlatform(platform: string): "android" | "ios" | "web" {
  if (platform === "ios") return "ios";
  if (platform === "android") return "android";
  return "web";
}

export async function initNativePushNotifications(params: InitPushParams): Promise<void> {
  if (!isMobileApp()) return;

  try {
    const [{ PushNotifications }, { Capacitor }] = await Promise.all([
      import("@capacitor/push-notifications"),
      import("@capacitor/core"),
    ]);

    const platform = mapPlatform(Capacitor.getPlatform());

    await PushNotifications.removeAllListeners();

    PushNotifications.addListener("registration", ({ value }) => {
      const token = (value || "").trim();
      if (!token) return;

      const lastToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (lastToken === token) return;

      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      void params.onRegistered(token, { platform, deviceId: Capacitor.getPlatform() });
    });

    PushNotifications.addListener("registrationError", (error) => {
      console.warn("[push] registration error:", error);
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("[push] notification received:", notification);
    });

    PushNotifications.addListener("pushNotificationActionPerformed", (event) => {
      const target = event.notification?.data?.screen;
      if (typeof target === "string" && target.startsWith("/")) {
        window.history.pushState({}, "", target);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    });

    const perm = await PushNotifications.checkPermissions();
    const granted = perm.receive === "granted"
      ? perm
      : await PushNotifications.requestPermissions();

    if (granted.receive !== "granted") {
      console.warn("[push] permission not granted");
      return;
    }

    await PushNotifications.register();
  } catch (err) {
    console.warn("[push] initialization error:", err);
  }
}
