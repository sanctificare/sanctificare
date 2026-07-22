import { useEffect, useRef } from "react";

interface AudioKeepAwakeOptions {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  artworkUrl?: string;
  onSeekTo?: (time: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

/**
 * Custom hook to prevent screen sleep during audio playback (Screen Wake Lock API)
 * and enable OS lockscreen controls / background audio metadata (MediaSession API).
 */
export function useAudioKeepAwake({
  isPlaying,
  title,
  artist = "Sanctificare",
  album,
  artworkUrl,
  onSeekTo,
  onPlay,
  onPause,
}: AudioKeepAwakeOptions) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // 1. Screen Wake Lock: keeps screen alive while audio is playing
  useEffect(() => {
    let active = true;

    async function requestWakeLock() {
      if (!isPlaying) return;
      if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

      try {
        if (!wakeLockRef.current) {
          const lock = await navigator.wakeLock.request("screen");
          if (active) {
            wakeLockRef.current = lock;
            lock.addEventListener("release", () => {
              wakeLockRef.current = null;
            });
          } else {
            void lock.release();
          }
        }
      } catch (err) {
        // Battery saver or hidden tab can reject wakeLock request silently
        console.warn("Screen Wake Lock request failed:", err);
      }
    }

    async function releaseWakeLock() {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
        } catch {
          // ignore
        }
        wakeLockRef.current = null;
      }
    }

    if (isPlaying) {
      void requestWakeLock();
    } else {
      void releaseWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isPlaying) {
        void requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void releaseWakeLock();
    };
  }, [isPlaying]);

  // 2. MediaSession API: OS lockscreen controls & background audio metadata
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

    if (isPlaying && title) {
      const artwork = artworkUrl
        ? [
            {
              src: artworkUrl,
              sizes: "512x512",
              type: "image/webp",
            },
          ]
        : [
            {
              src: "/assets/sanctificare-logo-v2.webp",
              sizes: "512x512",
              type: "image/webp",
            },
          ];

      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title,
          artist,
          album: album || "Oração",
          artwork,
        });

        navigator.mediaSession.playbackState = "playing";

        if (onPlay) {
          navigator.mediaSession.setActionHandler("play", onPlay);
        } else {
          navigator.mediaSession.setActionHandler("play", null);
        }

        if (onPause) {
          navigator.mediaSession.setActionHandler("pause", onPause);
        } else {
          navigator.mediaSession.setActionHandler("pause", null);
        }

        if (onSeekTo) {
          navigator.mediaSession.setActionHandler("seekto", (details) => {
            if (details.seekTime !== undefined && details.seekTime !== null) {
              onSeekTo(details.seekTime);
            }
          });
        } else {
          navigator.mediaSession.setActionHandler("seekto", null);
        }
      } catch (err) {
        console.warn("MediaSession setup warning:", err);
      }
    } else if (!isPlaying && navigator.mediaSession.playbackState === "playing") {
      navigator.mediaSession.playbackState = "paused";
    }
  }, [isPlaying, title, artist, album, artworkUrl, onPlay, onPause, onSeekTo]);
}
