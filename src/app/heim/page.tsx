"use client";

import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { ChildShell } from "@/components/child-shell";
import { RequirePlayer } from "@/components/require-player";
import { usePlayer } from "@/components/player-provider";
import { fourWeekProgram, getWorkout, shortWorkouts } from "@/content/programs/four-week";
import { getActiveSession, getCompletedSessions, getLatestCompletedSession } from "@/lib/offline/workout-db";
import type { LocalWorkoutSession } from "@/domain/session";
import { completedMainWorkoutsThisWeek } from "@/domain/weekly-goal";

function HomeContent() {
  const { player } = usePlayer();
  const [active, setActive] = useState<LocalWorkoutSession | null>();
  const [latest, setLatest] = useState<LocalWorkoutSession | null>();
  const [weeklyCompleted, setWeeklyCompleted] = useState(0);
  useEffect(() => { if (player) void Promise.all([getActiveSession(player.id), getLatestCompletedSession(player.id), getCompletedSessions(player.id)]).then(([a, l, completed]) => { setActive(a); setLatest(l); setWeeklyCompleted(completedMainWorkoutsThisWeek(completed, new Set(shortWorkouts.map(({ id }) => id)))); }); }, [player]);
  const workout = (active ? getWorkout(active.workoutId) : undefined) ?? getWorkout("w2")!;
  const { defaultCompletedMainWorkouts: goal, recommendedWorkoutSlots: slots } = fourWeekProgram.weeklyGoal;
  return <ChildShell><section className="pt-3">
    <p className="text-sm font-extrabold uppercase tracking-[.18em] text-pitch-700">Gaman að sjá þig</p>
    <h1 className="mt-1 text-3xl font-black">Hæ, {player?.name}!</h1>
    {active && <Link href="/aefing/virk" className="mt-5 flex min-h-16 items-center justify-between rounded-2xl border-2 border-sun bg-amber-50 px-4 font-bold"><span><span className="block text-xs uppercase tracking-wider text-amber-700">Æfing í gangi</span>Haltu áfram þar sem frá var horfið</span><ArrowRightIcon className="size-6" /></Link>}
    <div className="pitch-pattern mt-5 overflow-hidden rounded-[2rem] bg-pitch-700 p-6 text-white shadow-card">
      <p className="text-xs font-black uppercase tracking-[.2em] text-pitch-100">Næsta æfing · Vika 1</p>
      <h2 className="mt-3 text-3xl font-black leading-tight">{workout.title}</h2>
      <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
        <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2"><ClockIcon className="size-5" />{workout.durationMinutes.min}–{workout.durationMinutes.max} mín</span>
        <span className="rounded-full bg-white/15 px-3 py-2">{workout.equipment.join(" · ")}</span>
      </div>
      <Link href={active ? "/aefing/virk" : `/aefingar/${workout.id}`} className="mt-7 flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-sun px-4 text-lg font-black text-ink shadow-sm active:scale-[.99]">{active ? "HALDA ÁFRAM" : "HEFJA ÆFINGU"}<ArrowRightIcon className="size-6" /></Link>
    </div>
    <div className="mt-5 rounded-3xl bg-white p-5 shadow-card">
      <div className="flex items-start justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-slate-500">Markmið vikunnar</p><h2 className="mt-1 text-xl font-black">{goal} æfingar</h2></div><span className="rounded-full bg-pitch-100 px-3 py-1.5 text-sm font-black text-pitch-700">{Math.min(weeklyCompleted, goal)} af {goal}</span></div>
      <div className="mt-4 grid grid-cols-3 gap-2" aria-label="Þrír ráðlagðir æfingatímar, markmiðið er tvær æfingar">
        {Array.from({ length: slots }, (_, slot) => <div key={slot} className={`grid h-11 place-items-center rounded-xl ${slot < weeklyCompleted ? "bg-pitch-600 text-white" : "bg-slate-100 text-slate-400"}`}>{slot < weeklyCompleted ? <CheckIcon className="size-6" /> : <span className="size-3 rounded-full bg-slate-300" />}</div>)}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">Markmiðið er {goal === 2 ? "tvær" : goal} kláraðar aðalæfingar. {slots === 3 ? "Þrjú skipti eru" : `${slots} skipti eru`} ráðlögð, en aukaslotið er bara bónus.</p>
    </div>
    {latest && <div className="mt-5 rounded-3xl border border-pitch-100 bg-white p-5"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-pitch-700">Nýlega klárað</p><p className="mt-1 text-lg font-black">{latest.workoutTitle}</p></div>}
    <Link href="/aefingar#stutt" className="mt-5 flex min-h-16 items-center justify-between rounded-2xl border-2 border-pitch-200 bg-white px-5 font-black text-pitch-700">ÉG HEF BARA SMÁ TÍMA <ArrowRightIcon className="size-6" /></Link>
  </section></ChildShell>;
}

export default function HomePage() { return <RequirePlayer><HomeContent /></RequirePlayer>; }
