import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { ChildShell } from "@/components/child-shell";
import { RequirePlayer } from "@/components/require-player";
import { getWorkout } from "@/content/programs/four-week";
import { StartWorkoutButton } from "@/components/workout/start-workout-button";

export default async function WorkoutPreparationPage({ params }: { params: Promise<{ workoutId: string }> }) {
  const { workoutId } = await params;
  const workout = getWorkout(workoutId);
  if (!workout) notFound();
  return <RequirePlayer><ChildShell hideNavigation><div className="pt-2">
    <Link href="/aefingar" className="inline-flex min-h-12 items-center gap-2 font-bold text-pitch-700"><ArrowLeftIcon className="size-5" />Til baka</Link>
    <div className="mt-3 rounded-[2rem] bg-white p-6 shadow-card"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-pitch-700">{workout.isShortSession ? "Stutt aukaæfing" : `Æfing ${workout.order} · Vika ${workout.weekNumber}`}</p><h1 className="mt-2 text-3xl font-black leading-tight">{workout.title}</h1>
      <div className="mt-5 flex items-center gap-2 rounded-2xl bg-pitch-50 p-4 font-bold"><ClockIcon className="size-6 text-pitch-700" />Um {workout.durationMinutes.min === workout.durationMinutes.max ? workout.durationMinutes.min : `${workout.durationMinutes.min}–${workout.durationMinutes.max}`} mínútur</div>
      <h2 className="mt-6 text-sm font-extrabold uppercase tracking-[.14em] text-slate-500">Þú þarft</h2><ul className="mt-3 grid gap-2">{workout.equipment.map((item) => <li key={item} className="flex items-center gap-2 font-bold"><CheckCircleIcon className="size-6 text-pitch-600" />{item}</li>)}</ul>
      <h2 className="mt-6 text-sm font-extrabold uppercase tracking-[.14em] text-slate-500">Í dag æfir þú</h2><p className="mt-2 text-lg font-bold leading-relaxed">{workout.coachingPoint ?? workout.drills.map((drill) => drill.title).join(" · ")}</p>
    </div>
    <div className="sticky bottom-0 -mx-4 mt-6 bg-gradient-to-t from-pitch-50 via-pitch-50 p-4 pt-7"><StartWorkoutButton workout={workout} /></div>
  </div></ChildShell></RequirePlayer>;
}
