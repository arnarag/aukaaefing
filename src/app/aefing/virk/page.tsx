"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { ChildShell } from "@/components/child-shell";
import { RequirePlayer } from "@/components/require-player";
import { usePlayer } from "@/components/player-provider";
import { getActiveSession, saveSession } from "@/lib/offline/workout-db";
import {
  advanceSession,
  completePracticeRound,
  completePracticeTimer,
  completeSession,
  getPracticeProgress,
  startNextPracticeRound,
  withPracticeTimer,
  type DrillResult,
  type LocalWorkoutSession,
  type PracticeTimerSnapshot,
} from "@/domain/session";
import { getWorkout } from "@/content/programs/four-week";
import { DrillTimer } from "@/components/workout/drill-timer";
import { PracticeActionBar } from "@/components/workout/practice-action-bar";
import { ResultEntry, type ResultDraft } from "@/components/workout/result-entry";
import { useScreenWakeLock } from "@/lib/practice/use-screen-wake-lock";

function ActiveWorkout() {
  const { player } = usePlayer();
  const router = useRouter();
  const [session, setSession] = useState<LocalWorkoutSession>();
  const sessionRef = useRef<LocalWorkoutSession | undefined>(undefined);
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());
  const [viewDrillIndex, setViewDrillIndex] = useState<number>();
  const [draft, setDraft] = useState<ResultDraft>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useScreenWakeLock(Boolean(session && session.status === "active"));

  const enqueueSave = useCallback((updated: LocalWorkoutSession) => {
    const pending = saveQueue.current.then(() => saveSession(updated));
    saveQueue.current = pending.catch(() => undefined);
    return pending;
  }, []);

  const applyPracticeUpdate = useCallback((update: (current: LocalWorkoutSession) => LocalWorkoutSession) => {
    const current = sessionRef.current;
    if (!current) return Promise.resolve();
    const updated = update(current);
    sessionRef.current = updated;
    setSession(updated);
    setError("");
    return enqueueSave(updated).catch(() => {
      setError("Ekki tókst að vista stöðuna. Æfingin er enn opin á skjánum.");
    });
  }, [enqueueSave]);

  useEffect(() => {
    if (!player) return;
    void getActiveSession(player.id).then((saved) => {
      if (!saved) {
        router.replace("/heim");
        return;
      }
      sessionRef.current = saved;
      setSession(saved);
      setViewDrillIndex(saved.currentDrillIndex);
    });
  }, [player, router]);

  useEffect(() => {
    if (!session) return;
    sessionRef.current = session;
    setViewDrillIndex(session.currentDrillIndex);
  }, [session?.currentDrillIndex]);

  const workout = session ? getWorkout(session.workoutId) : undefined;
  const currentIndex = session?.currentDrillIndex ?? 0;
  const shownIndex = Math.min(viewDrillIndex ?? currentIndex, Math.max((workout?.drills.length ?? 1) - 1, 0));
  const drill = workout?.drills[shownIndex];
  const reviewingPrevious = Boolean(session && shownIndex < session.currentDrillIndex);
  const practice = session ? getPracticeProgress(session) : undefined;

  const persistTimerSnapshot = useCallback((snapshot: PracticeTimerSnapshot) => {
    void applyPracticeUpdate((current) => withPracticeTimer(current, snapshot));
  }, [applyPracticeUpdate]);

  const finishWorkTimer = useCallback(() => {
    const current = sessionRef.current;
    if (!current) return;
    const currentWorkout = getWorkout(current.workoutId);
    const currentDrill = currentWorkout?.drills[current.currentDrillIndex];
    if (!currentDrill) return;

    if (currentDrill.interval) {
      void applyPracticeUpdate((latest) => completePracticeRound(latest, currentDrill.interval!.rounds));
      return;
    }
    void applyPracticeUpdate((latest) => completePracticeTimer(latest));
  }, [applyPracticeUpdate]);

  const finishRestTimer = useCallback(() => {
    const current = sessionRef.current;
    if (!current) return;
    const currentWorkout = getWorkout(current.workoutId);
    const currentDrill = currentWorkout?.drills[current.currentDrillIndex];
    if (!currentDrill?.interval) return;
    void applyPracticeUpdate((latest) => startNextPracticeRound(latest, currentDrill.interval!.rounds));
  }, [applyPracticeUpdate]);

  if (!session || !workout || !drill || !practice) {
    return <ChildShell immersive><div className="grid min-h-[70vh] place-items-center font-bold text-pitch-700">Sæki vistaða æfingu…</div></ChildShell>;
  }

  const currentDrill = workout.drills[session.currentDrillIndex];
  const isCurrentDrill = shownIndex === session.currentDrillIndex;
  const currentHasTimer = Boolean(currentDrill.interval || currentDrill.durationSeconds || currentDrill.durationMinutes);
  const canEnterResult = isCurrentDrill && !reviewingPrevious && (!currentHasTimer || practice.phase === "result");
  const needsResult = Boolean(currentDrill.measurement && currentDrill.measurement.type !== "COMPLETED");
  const validResult = !needsResult || (currentDrill.measurement?.type === "FREE_CHOICE" ? Boolean(draft.choice) : draft.value !== undefined);

  const finishCurrentDrill = async () => {
    const latest = sessionRef.current;
    if (!latest || !validResult || saving) return;
    setSaving(true);
    setError("");

    let result: DrillResult | undefined;
    if (currentDrill.measurement) {
      result = { drillId: currentDrill.id, measurementType: currentDrill.measurement.type, ...draft };
    }

    const advanced = advanceSession(latest, currentDrill.id, result);
    const isLast = advanced.currentDrillIndex >= workout.drills.length;
    const updated = isLast ? completeSession(advanced) : advanced;

    try {
      await enqueueSave(updated);
      sessionRef.current = updated;
      if (isLast) {
        router.replace(`/aefing/lokid?session=${updated.id}`);
        return;
      }
      setSession(updated);
      setViewDrillIndex(updated.currentDrillIndex);
      setDraft({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Ekki tókst að vista. Prófaðu aftur áður en þú heldur áfram.");
    } finally {
      setSaving(false);
    }
  };

  const startNextRound = async () => {
    if (!currentDrill.interval || saving) return;
    setSaving(true);
    await applyPracticeUpdate((latest) => startNextPracticeRound(latest, currentDrill.interval!.rounds));
    setSaving(false);
  };

  const finalActionLabel = session.currentDrillIndex === workout.drills.length - 1 ? "KLÁRA ÆFINGU" : "NÆSTA VERKEFNI";
  const timerSeconds = currentDrill.interval?.workSeconds ?? currentDrill.durationSeconds ?? (currentDrill.durationMinutes?.min ?? 1) * 60;
  const showWorkTimer = isCurrentDrill && !reviewingPrevious && currentHasTimer && practice.phase === "ready";
  const showRestTimer = Boolean(isCurrentDrill && !reviewingPrevious && currentDrill.interval?.restSeconds && practice.phase === "rest");
  const showResult = canEnterResult && currentDrill.measurement;
  const workTimer = practice.timer?.kind === "work" ? practice.timer : undefined;
  const restTimer = practice.timer?.kind === "rest" ? practice.timer : undefined;

  return <ChildShell immersive>
    <article className="min-h-[calc(100dvh-2rem)] pb-8">
      <div className="flex min-h-12 items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setViewDrillIndex(Math.max(0, shownIndex - 1))}
          disabled={shownIndex === 0}
          className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 font-black text-pitch-700 disabled:invisible"
        >
          <ArrowLeftIcon className="size-5" /> Fyrra
        </button>
        <span className="text-sm font-black text-pitch-700">{session.currentDrillIndex + 1} af {workout.drills.length}</span>
        <span className="max-w-40 truncate text-right text-sm font-bold text-slate-500">{workout.title}</span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-pitch-100">
        <div className="h-full rounded-full bg-pitch-600 transition-all" style={{ width: `${((session.currentDrillIndex + 1) / workout.drills.length) * 100}%` }} />
      </div>

      {reviewingPrevious && <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center font-bold text-slate-600">Þetta verkefni er þegar lokið. Þú ert bara að skoða leiðbeiningarnar.</div>}

      <div className="mt-6">
        <p className="text-xs font-extrabold uppercase tracking-[.18em] text-pitch-700">{reviewingPrevious ? `Verkefni ${shownIndex + 1}` : "Verkefni dagsins"}</p>
        <h1 className="mt-2 text-4xl font-black leading-tight">{drill.title}</h1>
        <p className="mt-4 text-xl font-medium leading-relaxed text-slate-700">{drill.instructions}</p>
      </div>

      {!reviewingPrevious && currentDrill.interval && <div className="mt-5 rounded-2xl border border-pitch-200 bg-white px-4 py-4 text-center">
        <p className="text-xl font-black text-pitch-800">Umferð {practice.currentRound} af {currentDrill.interval.rounds}</p>
        <p className="mt-1 font-bold text-slate-600">{currentDrill.interval.workSeconds} sek. vinna{currentDrill.interval.restSeconds ? ` · ${currentDrill.interval.restSeconds} sek. hvíld` : ""}</p>
      </div>}

      {!reviewingPrevious && currentDrill.interval && practice.phase === "rest" && <div className="mt-6 rounded-3xl bg-white p-6 text-center shadow-card">
        <p className="text-2xl font-black">Umferð {practice.completedRounds} lokið</p>
        {!currentDrill.interval.restSeconds && <p className="mt-2 text-lg font-bold text-slate-600">Þegar þú ert tilbúinn skaltu byrja næstu umferð.</p>}
      </div>}

      {!reviewingPrevious && currentDrill.interval && practice.phase === "result" && <div className="mt-6 rounded-3xl bg-pitch-100 p-5 text-center">
        <p className="text-xl font-black text-pitch-900">Allar {currentDrill.interval.rounds} umferðir kláraðar</p>
      </div>}

      {showWorkTimer && <div className="mt-6">
        <DrillTimer
          key={`${currentDrill.id}-${practice.currentRound}-work`}
          initialSeconds={timerSeconds}
          kind="work"
          startLabel={currentDrill.interval ? `BYRJA UMFERÐ ${practice.currentRound}` : "BYRJA TÍMA"}
          savedTimer={workTimer}
          onSnapshot={persistTimerSnapshot}
          onComplete={finishWorkTimer}
        />
      </div>}

      {showRestTimer && currentDrill.interval?.restSeconds && <div className="mt-5">
        <DrillTimer
          key={`${currentDrill.id}-${practice.currentRound}-rest`}
          initialSeconds={currentDrill.interval.restSeconds}
          kind="rest"
          startLabel="BYRJA HVÍLD"
          savedTimer={restTimer}
          autoStart={!restTimer}
          onSnapshot={persistTimerSnapshot}
          onComplete={finishRestTimer}
        />
      </div>}

      {!reviewingPrevious && showResult && <div className="mt-5">
        <ResultEntry drill={currentDrill} value={draft} onChange={setDraft} />
      </div>}

      {error && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700" role="alert">{error}</p>}
    </article>

    {reviewingPrevious && <PracticeActionBar>
      <button onClick={() => setViewDrillIndex(session.currentDrillIndex)} className="min-h-16 w-full rounded-2xl bg-pitch-600 px-4 text-lg font-black text-white shadow-lg">AFTUR Í NÚVERANDI VERKEFNI</button>
    </PracticeActionBar>}

    {!reviewingPrevious && currentDrill.interval && practice.phase === "rest" && !currentDrill.interval.restSeconds && <PracticeActionBar>
      <button onClick={() => void startNextRound()} disabled={saving} className="min-h-16 w-full rounded-2xl bg-pitch-600 px-4 text-xl font-black text-white shadow-lg disabled:bg-slate-300">{saving ? "VISTA…" : `BYRJA UMFERÐ ${practice.currentRound + 1}`}</button>
    </PracticeActionBar>}

    {!reviewingPrevious && canEnterResult && <PracticeActionBar>
      <button onClick={() => void finishCurrentDrill()} disabled={!validResult || saving} className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-pitch-600 px-4 text-xl font-black text-white shadow-lg disabled:bg-slate-300 disabled:text-slate-500">
        <CheckIcon className="size-7" />{saving ? "VISTA…" : finalActionLabel}
      </button>
      {needsResult && !validResult && <p className="mt-2 text-center text-sm font-bold text-slate-500">Skráðu niðurstöðu til að halda áfram.</p>}
    </PracticeActionBar>}
  </ChildShell>;
}

export default function ActiveWorkoutPage() {
  return <RequirePlayer><ActiveWorkout /></RequirePlayer>;
}
