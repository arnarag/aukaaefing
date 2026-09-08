"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@heroicons/react/24/outline";
import { ChildShell } from "@/components/child-shell";
import { RequirePlayer } from "@/components/require-player";
import { usePlayer } from "@/components/player-provider";
import { getActiveSession, saveSession } from "@/lib/offline/workout-db";
import { advanceSession, completeSession, type DrillResult, type LocalWorkoutSession } from "@/domain/session";
import { getWorkout } from "@/content/programs/four-week";
import { DrillTimer } from "@/components/workout/drill-timer";
import { ResultEntry, type ResultDraft } from "@/components/workout/result-entry";

function ActiveWorkout() {
  const { player } = usePlayer(); const router = useRouter();
  const [session, setSession] = useState<LocalWorkoutSession>(); const [draft, setDraft] = useState<ResultDraft>({}); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  useEffect(() => { if (player) void getActiveSession(player.id).then((saved) => { if (saved) setSession(saved); else router.replace("/heim"); }); }, [player, router]);
  const workout = session ? getWorkout(session.workoutId) : undefined; const drill = workout?.drills[session?.currentDrillIndex ?? 0];
  if (!session || !workout || !drill) return <ChildShell hideNavigation><div className="grid min-h-[70vh] place-items-center font-bold text-pitch-700">Sæki vistaða æfingu…</div></ChildShell>;
  const needsResult = drill.measurement && drill.measurement.type !== "COMPLETED";
  const validResult = !needsResult || (drill.measurement?.type === "FREE_CHOICE" ? Boolean(draft.choice) : draft.value !== undefined);
  const next = async () => {
    if (!validResult || saving) return; setSaving(true); setError("");
    let result: DrillResult | undefined;
    if (drill.measurement) result = { drillId: drill.id, measurementType: drill.measurement.type, ...draft };
    const advanced = advanceSession(session, drill.id, result); const isLast = advanced.currentDrillIndex >= workout.drills.length; const updated = isLast ? completeSession(advanced) : advanced;
    try { await saveSession(updated); if (isLast) router.replace(`/aefing/lokid?session=${updated.id}`); else { setSession(updated); setDraft({}); setSaving(false); window.scrollTo({ top: 0, behavior: "smooth" }); } }
    catch { setError("Ekki tókst að vista. Prófaðu aftur áður en þú heldur áfram."); setSaving(false); }
  };
  return <ChildShell hideNavigation><article className="flex min-h-[calc(100dvh-80px)] flex-col pb-3 pt-1">
    <div className="flex items-center justify-between"><span className="text-sm font-black text-pitch-700">{session.currentDrillIndex + 1} af {workout.drills.length}</span><span className="text-sm font-bold text-slate-500">{workout.title}</span></div>
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-pitch-100"><div className="h-full rounded-full bg-pitch-600 transition-all" style={{ width: `${((session.currentDrillIndex + 1) / workout.drills.length) * 100}%` }} /></div>
    <div className="mt-7"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-pitch-700">Næsta verkefni</p><h1 className="mt-2 text-4xl font-black leading-tight">{drill.title}</h1><p className="mt-4 text-xl font-medium leading-relaxed text-slate-700">{drill.instructions}</p></div>
    {drill.interval && <div className="mt-5 rounded-2xl border border-pitch-200 bg-white px-4 py-3 text-center font-bold">{drill.interval.rounds} umferðir · {drill.interval.workSeconds} sek vinna{drill.interval.restSeconds ? ` · ${drill.interval.restSeconds} sek hvíld` : ""}</div>}
    {(drill.interval || drill.durationSeconds || drill.durationMinutes) && <div className="mt-6"><DrillTimer key={drill.id} initialSeconds={drill.interval?.workSeconds ?? drill.durationSeconds ?? (drill.durationMinutes?.min ?? 1) * 60} /></div>}
    {drill.measurement && <div className="mt-4"><ResultEntry drill={drill} value={draft} onChange={setDraft} /></div>}
    <div className="mt-auto pt-6"><button onClick={next} disabled={!validResult || saving} className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-pitch-600 px-4 text-xl font-black text-white shadow-lg disabled:bg-slate-300 disabled:text-slate-500"><CheckIcon className="size-7" />{saving ? "VISTA…" : session.currentDrillIndex === workout.drills.length - 1 ? "KLÁRA ÆFINGU" : "KLÁRAÐ"}</button>{needsResult && !validResult && <p className="mt-2 text-center text-sm font-bold text-slate-500">Skráðu niðurstöðu til að halda áfram.</p>}{error && <p className="mt-2 text-center text-sm font-bold text-red-700" role="alert">{error}</p>}</div>
  </article></ChildShell>;
}

export default function ActiveWorkoutPage() { return <RequirePlayer><ActiveWorkout /></RequirePlayer>; }
