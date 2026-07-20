import { cert, initializeApp, getApps, type ServiceAccount } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { TRPCError } from "@trpc/server";
import { ENV } from "./env";
import { disablePushTokens } from "../db";

type PushMessage = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

const ANDROID_NOTIFICATION_CHANNEL_ID = "sanctificare_general";
const ANDROID_NOTIFICATION_ICON = "ic_stat_sanctificare";
const ANDROID_NOTIFICATION_COLOR = "#C8A04D";

let fcmReady = false;

function readServiceAccount(): ServiceAccount | null {
  if (ENV.fcmServiceAccountJson) {
    const rawFirstChar = ENV.fcmServiceAccountJson.trimStart()[0];
    if (rawFirstChar !== "{") {
      console.error(
        "[FCM] FCM_SERVICE_ACCOUNT_JSON does not start with '{'. " +
        "Likely wrapped in quotes in .env. First char:",
        JSON.stringify(rawFirstChar),
      );
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "FCM_SERVICE_ACCOUNT_JSON is not valid JSON (starts with wrong character — remove surrounding quotes from .env).",
      });
    }
    try {
      const parsed = JSON.parse(ENV.fcmServiceAccountJson) as any;
      const mapped: ServiceAccount = {
        projectId: parsed.project_id || parsed.projectId,
        clientEmail: parsed.client_email || parsed.clientEmail,
        privateKey: parsed.private_key || parsed.privateKey,
      };
      if (mapped.projectId && mapped.clientEmail && mapped.privateKey) {
        return mapped;
      }
      console.error("[FCM] FCM_SERVICE_ACCOUNT_JSON parsed but is missing fields:", {
        hasProjectId: !!mapped.projectId,
        hasClientEmail: !!mapped.clientEmail,
        hasPrivateKey: !!mapped.privateKey,
      });
    } catch (parseErr) {
      console.error("[FCM] FCM_SERVICE_ACCOUNT_JSON JSON.parse() failed:", parseErr);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "FCM_SERVICE_ACCOUNT_JSON is not valid JSON.",
      });
    }
  }

  if (ENV.fcmProjectId && ENV.fcmClientEmail && ENV.fcmPrivateKey) {
    return {
      projectId: ENV.fcmProjectId,
      clientEmail: ENV.fcmClientEmail,
      privateKey: ENV.fcmPrivateKey,
    };
  }

  console.error("[FCM] No FCM credentials found. Set FCM_SERVICE_ACCOUNT_JSON or FCM_PROJECT_ID + FCM_CLIENT_EMAIL + FCM_PRIVATE_KEY.");
  return null;
}

function ensureFirebaseMessaging() {
  if (fcmReady) {
    return getMessaging();
  }

  const serviceAccount = readServiceAccount();
  if (!serviceAccount) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "FCM credentials are not configured.",
    });
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId,
    });
  }

  fcmReady = true;
  return getMessaging();
}

function truncateText(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 3))}...`;
}

export async function sendPushToTokens(tokens: string[], message: PushMessage): Promise<{ successCount: number; failureCount: number }> {
  if (tokens.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  const client = ensureFirebaseMessaging();
  const invalidTokens: string[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (let start = 0; start < tokens.length; start += 500) {
    const batch = tokens.slice(start, start + 500);
    const response = await client.sendEachForMulticast({
      tokens: batch,
      notification: {
        title: truncateText(message.title, 120),
        body: truncateText(message.body, 500),
      },
      data: message.data,
      android: {
        priority: "high",
        notification: {
          channelId: ANDROID_NOTIFICATION_CHANNEL_ID,
          icon: ANDROID_NOTIFICATION_ICON,
          color: ANDROID_NOTIFICATION_COLOR,
          sound: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    });

    successCount += response.successCount;
    failureCount += response.failureCount;
    response.responses.forEach((entry: (typeof response.responses)[number], index: number) => {
      if (entry.success) return;
      const code = entry.error?.code;
      if (
        code === "messaging/invalid-registration-token" ||
        code === "messaging/registration-token-not-registered"
      ) {
        invalidTokens.push(batch[index]);
      }
    });
  }

  if (invalidTokens.length > 0) {
    await disablePushTokens(invalidTokens);
  }

  return {
    successCount,
    failureCount,
  };
}
