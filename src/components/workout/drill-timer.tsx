"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatTime, secondsRemaining } from "@/domain/timer";
import type { PracticeTimerKind, PracticeTimerSnapshot } from "@/domain/session";
import { PracticeActionBar } from "@/components/workout/practice-action-bar";
import { playPracticeCue, unlockPracticeAudio, vibratePracticeCue } from "@/lib/practice/cues";

function remainingFromSaved(timer: PracticeTimerSnapshot, initialSeconds: number) {
  if (timer.status === "active" && timer.endAt) {
    const end = Date.parse(timer.endAt);
    if (Number.isFinite(end)) return secondsRemaining(end, Date.now());
  }
  return Math.max(0, Math.min(timer.remainingSeconds, initialSeconds));
}

export function DrillTimer({
  initialSeconds,
  kind = "work",
  startLabel = "BYRJA TÍMA",
  resetLabel = "ENDURSTILLA TÍMA",
  finishEarlyLabel = "KLÁRA VERKEFNI",
  savedTimer,
  autoStart = false,
  onSnapshot,
  onComplete,
  onFinishEarly,
}: {
  initialSeconds: number;
  kind?: PracticeTimerKind;
  startLabel?: string;
  resetLabel?: string;
  finishEarlyLabel?: string;
  savedTimer?: PracticeTimerSnapshot;
  autoStart?: boolean;
  onSnapshot?: (snapshot: PracticeTimerSnapshot) => void;
  onComplete?: () => void;
  onFinishEarly?: () => void;
}) {
  const restored = useMemo(
    () => savedTimer?.kind === kind && savedTimer.totalSeconds === initialSeconds ? savedTimer : undefined,
    [initialSeconds, kind, savedTimer],
  );
  const initialRestored = useRef(restored).current;
  const [remaining, setRemaining] = useState(() => initialRestored ? remainingFromSaved(initialRestored, initialSeconds) : initialSeconds);
  const [running, setRunning] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [interrupted, setInterrupted] = useState(Boolean(initialRestored && initialRestored.status !== "ready"));
  const endAt = useRef<number | undefined>(undefined);
  const autoStarted = useRef(false);
  const completionSent = useRef(false);
  const onSnapshotRef = useRef(onSnapshot);
  const onCompleteRef = useRef(onComplete);
  const onFinishEarlyRef = useRef(onFinishEarly);

  useEffect(() => { onSnapshotRef.current = onSnapshot; }, [onSnapshot]);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onFinishEarlyRef.current = onFinishEarly; }, [onFinishEarly]);

  const emitSnapshot = useCallback((status: PracticeTimerSnapshot["status"], seconds: number, end?: number) => {
    onSnapshotRef.current?.({
      kind,
      status,
      totalSeconds: initialSeconds,
      remainingSeconds: Math.max(0, Math.min(seconds, initialSeconds)),
      ...(end ? { endAt: new Date(end).toISOString() } : {}),
    });
  }, [initialSeconds, kind]);

  const beginRunning = useCallback(() => {
    const nextEnd = Date.now() + remaining * 1000;
    endAt.current = nextEnd;
    setInterrupted(false);
    setRunning(true);
    emitSnapshot("active", remaining, nextEnd);
  }, [emitSnapshot, remaining]);

  const beginWithCountdown = async () => {
    await unlockPracticeAudio();
    setInterrupted(false);
    setCountdown(3);
  };

  const pause = useCallback((becauseInterrupted: boolean) => {
    if (countdown !== null) {
      setCountdown(null);
      setInterrupted(becauseInterrupted);
      emitSnapshot("paused", remaining);
      return;
    }
    if (!running) return;
    const next = secondsRemaining(endAt.current ?? Date.now(), Date.now());
    setRemaining(next);
    setRunning(false);
    setInterrupted(becauseInterrupted);
    emitSnapshot("paused", next);
  }, [countdown, emitSnapshot, remaining, running]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      playPracticeCue("start");
      vibratePracticeCue("start");
      beginRunning();
      return;
    }
    const id = window.setTimeout(() => setCountdown((current) => current === null ? null : Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [beginRunning, countdown]);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const next = secondsRemaining(endAt.current ?? Date.now(), Date.now());
      setRemaining(next);
      if (next !== 0 || completionSent.current) return;
      completionSent.current = true;
      setRunning(false);
      setFinished(true);
      playPracticeCue("finish");
      vibratePracticeCue("finish");
      onCompleteRef.current?.();
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    const handleHidden = () => {
      if (document.visibilityState === "hidden") pause(true);
    };
    const handlePageHide = () => pause(true);
    document.addEventListener("visibilitychange", handleHidden);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("visibilitychange", handleHidden);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [pause]);

  useEffect(() => {
    if (!initialRestored || initialRestored.status !== "active") return;
    const next = remainingFromSaved(initialRestored, initialSeconds);
    setRemaining(next);
    setInterrupted(true);
    emitSnapshot("paused", next);
  }, [emitSnapshot, initialRestored, initialSeconds]);

  useEffect(() => {
    if (!autoStart || initialRestored || autoStarted.current || remaining <= 0) return;
    autoStarted.current = true;
    beginRunning();
  }, [autoStart, beginRunning, initialRestored, remaining]);

  const toggle = () => {
    if (running || countdown !== null) {
      pause(false);
      return;
    }
    void beginWithCountdown();
  };

  const reset = () => {
    endAt.current = undefined;
    completionSent.current = false;
    setRunning(false);
    setCountdown(null);
    setFinished(false);
    setInterrupted(false);
    setRemaining(initialSeconds);
    emitSnapshot("ready", initialSeconds);
  };

  const finishEarly = () => {
    if (running || countdown !== null) pause(false);
    onFinishEarlyRef.current?.();
  };

  const paused = !running && countdown === null && !finished && remaining < initialSeconds;
  const label = kind === "rest" ? "Hvíld" : "Tími";
  const hasStarted = running || countdown !== null || interrupted || remaining !== initialSeconds;
  const canReset = hasStarted || finished;
  const canFinishEarly = Boolean(onFinishEarly) && !finished && hasStarted;

  return <>
    <div className="rounded-3xl bg-ink p-5 text-center text-white">
      <p className="text-xs font-extrabold uppercase tracking-[.18em] text-pitch-100">{countdown !== null ? "Byrjar eftir" : label}</p>
      <div className="my-2 font-mono text-6xl font-black tabular-nums" aria-live="polite">
        {countdown !== null ? countdown : formatTime(remaining)}
      </div>
      {interrupted && !running && countdown === null && !finished && <p className="mt-3 text-lg font-black text-sun">{kind === "rest" ? "Hvíld í bið" : "Æfing í bið"}</p>}
      {!interrupted && paused && <p className="mt-3 text-lg font-black text-pitch-100">Tími í bið</p>}
      {finished && <p className="mt-3 text-lg font-black text-pitch-100">Tími stöðvaður</p>}
      {canReset && <button type="button" onClick={reset} className="mt-3 min-h-11 rounded-xl px-4 text-sm font-extrabold text-pitch-100 underline decoration-pitch-300 underline-offset-4">{resetLabel}</button>}
    </div>

    {!finished && <PracticeActionBar>
      <button
        onClick={toggle}
        disabled={countdown !== null}
        className="min-h-16 w-full rounded-2xl bg-pitch-600 px-4 text-xl font-black text-white shadow-lg disabled:bg-pitch-500"
      >
        {countdown !== null ? `BYRJAR EFTIR ${countdown}` : running ? "PÁSA" : remaining === initialSeconds && !interrupted ? startLabel : "HALDA ÁFRAM"}
      </button>
      {canFinishEarly && <button type="button" onClick={finishEarly} className="mt-2 min-h-12 w-full rounded-xl px-4 text-base font-black text-pitch-800 underline decoration-pitch-300 underline-offset-4">{finishEarlyLabel}</button>}
    </PracticeActionBar>}
  </>;
}
