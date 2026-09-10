"use client";

import { useEffect, useRef } from "react";

type WakeLockSentinelLike = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
};

export function useScreenWakeLock(enabled = true) {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || typeof document === "undefined") return;
    const wakeLock = (navigator as WakeLockNavigator).wakeLock;
    if (!wakeLock) return;

    let mounted = true;

    const request = async () => {
      if (!mounted || document.visibilityState !== "visible" || sentinelRef.current) return;
      try {
        const sentinel = await wakeLock.request("screen");
        if (!mounted) {
          await sentinel.release();
          return;
        }
        sentinelRef.current = sentinel;
        sentinel.addEventListener("release", () => {
          if (sentinelRef.current === sentinel) sentinelRef.current = null;
        });
      } catch {
        // Wake lock is a progressive enhancement. Practice must still work without it.
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") void request();
    };

    void request();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", handleVisibility);
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      if (sentinel && !sentinel.released) void sentinel.release();
    };
  }, [enabled]);
}
