import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface PendingPrayerLog {
  tempId: string;
  prayerType: string;
  prayerName: string;
  completedAt: string;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  const logMutation = trpc.prayers.logPrayer.useMutation();
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getPendingLogs = (): PendingPrayerLog[] => {
    try {
      const stored = localStorage.getItem("pending_prayer_logs");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("[OfflineSync] Error reading pending logs:", e);
      return [];
    }
  };

  const savePendingLogs = (logs: PendingPrayerLog[]) => {
    try {
      localStorage.setItem("pending_prayer_logs", JSON.stringify(logs));
    } catch (e) {
      console.error("[OfflineSync] Error saving pending logs:", e);
    }
  };

  const queueOfflinePrayerLog = useCallback((prayerType: string, prayerName: string) => {
    const logs = getPendingLogs();
    const newLog: PendingPrayerLog = {
      tempId: Math.random().toString(36).substring(2, 9),
      prayerType,
      prayerName,
      completedAt: new Date().toISOString(),
    };
    logs.push(newLog);
    savePendingLogs(logs);

    toast.info("Você está offline. Oração registrada localmente e será sincronizada assim que retornar a conexão!");
  }, []);

  const syncOfflineLogs = useCallback(async () => {
    if (!isOnline || isSyncingRef.current) return;
    
    const logs = getPendingLogs();
    if (logs.length === 0) return;

    isSyncingRef.current = true;
    console.log(`[OfflineSync] Syncing ${logs.length} offline prayer logs...`);
    
    let successCount = 0;
    const remainingLogs: PendingPrayerLog[] = [];

    for (const log of logs) {
      try {
        await logMutation.mutateAsync({
          prayerType: log.prayerType,
          prayerName: log.prayerName,
        });
        successCount++;
      } catch (err) {
        console.error(`[OfflineSync] Failed to sync log ${log.tempId}:`, err);
        remainingLogs.push(log);
      }
    }

    savePendingLogs(remainingLogs);
    isSyncingRef.current = false;

    if (successCount > 0) {
      toast.success(`${successCount} oração(ões) offline sincronizada(s) com sucesso!`);
    }
  }, [isOnline, logMutation]);

  // Sync on mount or when coming back online
  useEffect(() => {
    if (isOnline) {
      syncOfflineLogs();
    }
  }, [isOnline, syncOfflineLogs]);

  // Check periodically (every 45s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline) {
        syncOfflineLogs();
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [isOnline, syncOfflineLogs]);

  return {
    isOnline,
    queueOfflinePrayerLog,
    syncOfflineLogs,
    hasPending: getPendingLogs().length > 0,
  };
}
