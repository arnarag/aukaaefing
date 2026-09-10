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
  const requestInFlightRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || typeof document === "undefined") return;
    const wakeLock = (navigator as WakeLockNavigator).wakeLock;
    if (!wakeLock) return;

    let mounted = true;

    const request = () => {
      if (!mounted || document.visibilityState !== "visible" || sentinelRef.current || requestInFlightRef.current) return;

      const pending = (async () => {
        try {
          const sentinel = await wakeLock.request("screen");
          if (!mounted || document.visibilityState !== "visible") {
            if (!sentinel.released) await sentinel.release();
            return;
          }

          const previous = sentinelRef.current;
          if (previous && previous !== sentinel && !previous.released) await previous.release();

          sentinelRef.current = sentinel;
          sentinel.addEventListener("release", () => {
            if (sentinelRef.current === sentinel) sentinelRef.current = null;
          });
        } catch {
          // Wake lock is a progressive enhancement. Practice must still work without it.
        } finally {
          requestInFlightRef.current = null;
        }
      })();

      requestInFlightRef.current = pending;
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") request();
    };

    request();
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
