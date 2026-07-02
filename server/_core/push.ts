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

let fcmReady = false;

function readServiceAccount(): ServiceAccount | null {
  if (ENV.fcmServiceAccountJson) {
    try {
      const parsed = JSON.parse(ENV.fcmServiceAccountJson) as ServiceAccount;
      if (parsed.projectId && parsed.clientEmail && parsed.privateKey) {
        return parsed;
      }
    } catch {
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
  const response = await client.sendEachForMulticast({
    tokens,
    notification: {
      title: truncateText(message.title, 120),
      body: truncateText(message.body, 500),
    },
    data: message.data,
    android: {
      priority: "high",
      notification: {
        channelId: "default",
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

  const invalidTokens: string[] = [];
  response.responses.forEach((entry: (typeof response.responses)[number], index: number) => {
    if (entry.success) return;
    const code = entry.error?.code;
    if (
      code === "messaging/invalid-registration-token" ||
      code === "messaging/registration-token-not-registered"
    ) {
      invalidTokens.push(tokens[index]);
    }
  });

  if (invalidTokens.length > 0) {
    await disablePushTokens(invalidTokens);
  }

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
  };
}
