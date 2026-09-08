import Link from "next/link";
import { ChevronRightIcon, ClockIcon } from "@heroicons/react/24/outline";
import { ChildShell } from "@/components/child-shell";
import { RequirePlayer } from "@/components/require-player";
import { fourWeekProgram, mainWorkouts, shortWorkouts } from "@/content/programs/four-week";

export default function WorkoutsPage() {
  return <RequirePlayer><ChildShell><div className="pt-3"><p className="text-sm font-extrabold uppercase tracking-[.18em] text-pitch-700">{fourWeekProgram.title}</p><h1 className="mt-1 text-3xl font-black">Æfingar</h1>
    <div className="mt-6 space-y-7">{fourWeekProgram.weeks.map((week) => <section key={week.number}><div className="mb-3"><h2 className="text-xl font-black">{week.title}</h2><p className="text-sm text-slate-600">{week.focus}</p></div><div className="space-y-3">{mainWorkouts.filter((workout) => workout.weekNumber === week.number).map((workout) => <Link key={workout.id} href={`/aefingar/${workout.id}`} className="flex min-h-20 items-center gap-4 rounded-2xl bg-white p-4 shadow-sm"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-pitch-100 font-black text-pitch-700">{workout.order}</span><span className="min-w-0 flex-1"><span className="block font-black">{workout.title}</span><span className="mt-1 flex items-center gap-1 text-sm text-slate-500"><ClockIcon className="size-4" />{workout.durationMinutes.min}–{workout.durationMinutes.max} mín</span></span><ChevronRightIcon className="size-5 text-slate-400" /></Link>)}</div></section>)}</div>
    <section id="stutt" className="mt-9 scroll-mt-4"><h2 className="text-2xl font-black">Stuttar aukaæfingar</h2><p className="mt-1 text-slate-600">Léttar, jákvæðar og án pressu.</p><div className="mt-4 grid grid-cols-3 gap-3">{shortWorkouts.map((workout) => <Link key={workout.id} href={`/aefingar/${workout.id}`} className="grid min-h-28 place-items-center rounded-2xl bg-white p-3 text-center shadow-sm"><span className="text-xl font-black text-pitch-700">{workout.durationMinutes.min}<span className="block text-xs">MÍN</span></span></Link>)}</div></section>
  </div></ChildShell></RequirePlayer>;
}
