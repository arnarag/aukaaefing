"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { ChildShell } from "@/components/child-shell";
import { RequirePlayer } from "@/components/require-player";
import { usePlayer } from "@/components/player-provider";
import { getActiveSession, saveSession } from "@/lib/offline/workout-db";
import {
  advanceSession,
  completePracticeRound,
  completeSession,
  getPracticeProgress,
  startNextPracticeRound,
  type DrillResult,
  type LocalWorkoutSession,
} from "@/domain/session";
import { getWorkout } from "@/content/programs/four-week";
import { DrillTimer, type DrillTimerStatus } from "@/components/workout/drill-timer";
import { PracticeActionBar } from "@/components/workout/practice-action-bar";
import { ResultEntry, type ResultDraft } from "@/components/workout/result-entry";

function ActiveWorkout() {
  const { player } = usePlayer();
  const router = useRouter();
  const [session, setSession] = useState<LocalWorkoutSession>();
  const [viewDrillIndex, setViewDrillIndex] = useState<number>();
  const [draft, setDraft] = useState<ResultDraft>({});
  const [timerStatus, setTimerStatus] = useState<DrillTimerStatus>("ready");
  const [saving, setSaving] = useState(false);
  const [pendingSave, setPendingSave] = useState<LocalWorkoutSession>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!player) return;
    void getActiveSession(player.id).then((saved) => {
      if (!saved) {
        router.replace("/heim");
        return;
      }
      setSession(saved);
      setViewDrillIndex(saved.currentDrillIndex);
    });
  }, [player, router]);

  useEffect(() => {
    if (!session) return;
    setViewDrillIndex(session.currentDrillIndex);
    setTimerStatus("ready");
  }, [session?.currentDrillIndex]);

  const workout = session ? getWorkout(session.workoutId) : undefined;
  const currentIndex = session?.currentDrillIndex ?? 0;
  const currentDrill = workout?.drills[currentIndex];
  const shownIndex = Math.min(viewDrillIndex ?? currentIndex, Math.max((workout?.drills.length ?? 1) - 1, 0));
  const reviewDrill = workout?.drills[shownIndex];
  const reviewingPrevious = Boolean(session && shownIndex < session.currentDrillIndex);
  const practice = session ? getPracticeProgress(session) : undefined;

  const persistPracticeChange = useCallback(async (updated: LocalWorkoutSession) => {
    setSaving(true);
    setError("");
    setSession(updated);
    setPendingSave(updated);
    try {
      await saveSession(updated);
      setPendingSave(undefined);
    } catch {
      setError("Ekki tókst að vista stöðuna. Reyndu aftur áður en þú heldur áfram.");
    } finally {
      setSaving(false);
    }
  }, []);

  const retryPendingSave = async () => {
    if (!pendingSave || saving) return;
    setSaving(true);
    setError("");
    try {
      await saveSession(pendingSave);
      setPendingSave(undefined);
    } catch {
      setError("Ekki tókst að vista stöðuna. Reyndu aftur.");
    } finally {
      setSaving(false);
    }
  };

  const finishIntervalRound = useCallback(() => {
    if (!session || !workout) return;
    const drill = workout.drills[session.currentDrillIndex];
    if (!drill?.interval) return;
    void persistPracticeChange(completePracticeRound(session, drill.interval.rounds));
  }, [persistPracticeChange, session, workout]);

  if (!session || !workout || !currentDrill || !reviewDrill || !practice) {
    return <ChildShell immersive><div className="grid min-h-[70vh] place-items-center font-bold text-pitch-700">Sæki vistaða æfingu…</div></ChildShell>;
  }

  const currentHasTimer = Boolean(currentDrill.interval || currentDrill.durationSeconds || currentDrill.durationMinutes);
  const intervalComplete = Boolean(currentDrill.interval && practice.phase === "result");
  const canEnterResult = currentDrill.interval ? intervalComplete : !currentHasTimer || timerStatus === "finished";
  const needsResult = Boolean(currentDrill.measurement && currentDrill.measurement.type !== "COMPLETED");
  const validResult = !needsResult || (currentDrill.measurement?.type === "FREE_CHOICE" ? Boolean(draft.choice) : draft.value !== undefined);

  const finishCurrentDrill = async () => {
    if (!validResult || saving || pendingSave) return;
    setSaving(true);
    setError("");

    let result: DrillResult | undefined;
    if (currentDrill.measurement) {
      result = { drillId: currentDrill.id, measurementType: currentDrill.measurement.type, ...draft };
    }

    const advanced = advanceSession(session, currentDrill.id, result);
    const isLast = advanced.currentDrillIndex >= workout.drills.length;
    const updated = isLast ? completeSession(advanced) : advanced;

    try {
      await saveSession(updated);
      if (isLast) {
        router.replace(`/aefing/lokid?session=${updated.id}`);
        return;
      }
      setSession(updated);
      setViewDrillIndex(updated.currentDrillIndex);
      setDraft({});
      setTimerStatus("ready");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Ekki tókst að vista. Prófaðu aftur áður en þú heldur áfram.");
    } finally {
      setSaving(false);
    }
  };

  const startNextRound = () => {
    if (!currentDrill.interval || saving || pendingSave) return;
    void persistPracticeChange(startNextPracticeRound(session, currentDrill.interval.rounds));
  };

  const finalActionLabel = session.currentDrillIndex === workout.drills.length - 1 ? "KLÁRA ÆFINGU" : "NÆSTA VERKEFNI";
  const timerSeconds = currentDrill.interval?.workSeconds ?? currentDrill.durationSeconds ?? (currentDrill.durationMinutes?.min ?? 1) * 60;
  const showCurrentTimer = currentHasTimer && (!currentDrill.interval || practice.phase === "ready") && !pendingSave;
  const showResult = canEnterResult && currentDrill.measurement;

  return <ChildShell immersive>
    <article className="min-h-[calc(100dvh-2rem)] pb-8">
      <div className="flex min-h-12 items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setViewDrillIndex(Math.max(0, session.currentDrillIndex - 1))}
          disabled={session.currentDrillIndex === 0}
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

      <div className="mt-6">
        <p className="text-xs font-extrabold uppercase tracking-[.18em] text-pitch-700">Verkefni dagsins</p>
        <h1 className="mt-2 text-4xl font-black leading-tight">{currentDrill.title}</h1>
        <p className="mt-4 text-xl font-medium leading-relaxed text-slate-700">{currentDrill.instructions}</p>
      </div>

      {currentDrill.interval && <div className="mt-5 rounded-2xl border border-pitch-200 bg-white px-4 py-4 text-center">
        <p className="text-xl font-black text-pitch-800">Umferð {practice.currentRound} af {currentDrill.interval.rounds}</p>
        <p className="mt-1 font-bold text-slate-600">{currentDrill.interval.workSeconds} sek. vinna{currentDrill.interval.restSeconds ? ` · ${currentDrill.interval.restSeconds} sek. hvíld` : ""}</p>
      </div>}

      {currentDrill.interval && practice.phase === "rest" && <div className="mt-6 rounded-3xl bg-white p-6 text-center shadow-card">
        <p className="text-2xl font-black">Umferð {practice.completedRounds} lokið</p>
        <p className="mt-2 text-lg font-bold text-slate-600">{currentDrill.interval.restSeconds ? `Hvíldu í ${currentDrill.interval.restSeconds} sekúndur.` : "Þegar þú ert tilbúinn skaltu byrja næstu umferð."}</p>
      </div>}

      {currentDrill.interval && practice.phase === "result" && <div className="mt-6 rounded-3xl bg-pitch-100 p-5 text-center">
        <p className="text-xl font-black text-pitch-900">Allar {currentDrill.interval.rounds} umferðir kláraðar</p>
      </div>}

      {showCurrentTimer && <div className="mt-6">
        <DrillTimer
          key={`${currentDrill.id}-${practice.currentRound}`}
          initialSeconds={timerSeconds}
          startLabel={currentDrill.interval ? `BYRJA UMFERÐ ${practice.currentRound}` : "BYRJA TÍMA"}
          resetLabel={currentDrill.interval ? `ENDURTAKA UMFERÐ ${practice.currentRound}` : "ENDURSTILLA TÍMA"}
          onComplete={currentDrill.interval ? finishIntervalRound : undefined}
          onStatusChange={setTimerStatus}
        />
      </div>}

      {showResult && <div className="mt-5">
        <ResultEntry drill={currentDrill} value={draft} onChange={setDraft} />
      </div>}

      {error && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-700" role="alert">{error}</p>}
    </article>

    {pendingSave && <PracticeActionBar>
      <button onClick={() => void retryPendingSave()} disabled={saving} className="min-h-16 w-full rounded-2xl bg-pitch-600 px-4 text-xl font-black text-white shadow-lg disabled:bg-slate-300">{saving ? "VISTA…" : "REYNA AFTUR"}</button>
      <p className="mt-2 text-center text-sm font-bold text-red-700">Vista þarf stöðuna áður en þú heldur áfram.</p>
    </PracticeActionBar>}

    {!pendingSave && currentDrill.interval && practice.phase === "rest" && <PracticeActionBar>
      <button onClick={startNextRound} disabled={saving} className="min-h-16 w-full rounded-2xl bg-pitch-600 px-4 text-xl font-black text-white shadow-lg disabled:bg-slate-300">{saving ? "VISTA…" : `BYRJA UMFERÐ ${practice.currentRound + 1}`}</button>
    </PracticeActionBar>}

    {!pendingSave && canEnterResult && <PracticeActionBar>
      <button onClick={() => void finishCurrentDrill()} disabled={!validResult || saving} className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-pitch-600 px-4 text-xl font-black text-white shadow-lg disabled:bg-slate-300 disabled:text-slate-500">
        <CheckIcon className="size-7" />{saving ? "VISTA…" : finalActionLabel}
      </button>
      {needsResult && !validResult && <p className="mt-2 text-center text-sm font-bold text-slate-500">Skráðu niðurstöðu til að halda áfram.</p>}
    </PracticeActionBar>}

    {reviewingPrevious && <div className="fixed inset-0 z-40 overflow-y-auto bg-pitch-50 pb-32 text-ink">
      <div className="mx-auto max-w-lg px-4 pt-4">
        <div className="flex min-h-12 items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setViewDrillIndex(Math.max(0, shownIndex - 1))}
            disabled={shownIndex === 0}
            className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 font-black text-pitch-700 disabled:invisible"
          >
            <ArrowLeftIcon className="size-5" /> Fyrra
          </button>
          <span className="text-sm font-black text-slate-500">Skoða verkefni {shownIndex + 1}</span>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center font-bold text-slate-600">Þetta verkefni er þegar lokið. Núverandi tímamælir heldur stöðunni á meðan.</div>
        <p className="mt-7 text-xs font-extrabold uppercase tracking-[.18em] text-pitch-700">Verkefni {shownIndex + 1}</p>
        <h1 className="mt-2 text-4xl font-black leading-tight">{reviewDrill.title}</h1>
        <p className="mt-4 text-xl font-medium leading-relaxed text-slate-700">{reviewDrill.instructions}</p>
      </div>
      <PracticeActionBar>
        <button onClick={() => setViewDrillIndex(session.currentDrillIndex)} className="min-h-16 w-full rounded-2xl bg-pitch-600 px-4 text-lg font-black text-white shadow-lg">AFTUR Í NÚVERANDI VERKEFNI</button>
      </PracticeActionBar>
    </div>}
  </ChildShell>;
}

export default function ActiveWorkoutPage() {
  return <RequirePlayer><ActiveWorkout /></RequirePlayer>;
}
