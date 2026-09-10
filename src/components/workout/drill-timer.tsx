"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime, secondsRemaining } from "@/domain/timer";
import { PracticeActionBar } from "@/components/workout/practice-action-bar";

export type DrillTimerStatus = "ready" | "running" | "paused" | "finished";

export function DrillTimer({
  initialSeconds,
  startLabel = "BYRJA TÍMA",
  resetLabel = "ENDURSTILLA TÍMA",
  onComplete,
  onStatusChange,
}: {
  initialSeconds: number;
  startLabel?: string;
  resetLabel?: string;
  onComplete?: () => void;
  onStatusChange?: (status: DrillTimerStatus) => void;
}) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const endAt = useRef<number | undefined>(undefined);
  const completionSent = useRef(false);

  const status: DrillTimerStatus = finished ? "finished" : running ? "running" : remaining === initialSeconds ? "ready" : "paused";
  useEffect(() => { onStatusChange?.(status); }, [onStatusChange, status]);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const next = secondsRemaining(endAt.current ?? Date.now(), Date.now());
      setRemaining(next);
      if (next === 0) {
        setRunning(false);
        setFinished(true);
        if (!completionSent.current) {
          completionSent.current = true;
          onComplete?.();
        }
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [onComplete, running]);

  const toggle = () => {
    if (running) {
      setRunning(false);
      return;
    }
    endAt.current = Date.now() + remaining * 1000;
    setRunning(true);
  };

  const reset = () => {
    endAt.current = undefined;
    completionSent.current = false;
    setRunning(false);
    setFinished(false);
    setRemaining(initialSeconds);
  };

  const canReset = running || finished || remaining !== initialSeconds;

  return <>
    <div className="rounded-3xl bg-ink p-5 text-center text-white">
      <p className="text-xs font-extrabold uppercase tracking-[.18em] text-pitch-100">Tími</p>
      <div className="my-2 font-mono text-6xl font-black tabular-nums" aria-live="polite">{formatTime(remaining)}</div>
      {finished && <p className="mt-3 text-lg font-black text-pitch-100">Tíminn er búinn</p>}
      {canReset && <button type="button" onClick={reset} className="mt-3 min-h-11 rounded-xl px-4 text-sm font-extrabold text-pitch-100 underline decoration-pitch-300 underline-offset-4">{resetLabel}</button>}
    </div>
    {!finished && <PracticeActionBar>
      <button onClick={toggle} className="min-h-16 w-full rounded-2xl bg-pitch-600 px-4 text-xl font-black text-white shadow-lg">
        {running ? "PÁSA" : remaining === initialSeconds ? startLabel : "HALDA ÁFRAM"}
      </button>
    </PracticeActionBar>}
  </>;
}
