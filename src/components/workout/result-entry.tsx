"use client";

import type { Drill } from "@/content/schema";

export type ResultDraft = { value?: number; choice?: string };

export function ResultEntry({ drill, value, onChange }: { drill: Drill; value: ResultDraft; onChange: (result: ResultDraft) => void }) {
  const measurement = drill.measurement; if (!measurement || measurement.type === "COMPLETED") return null;
  if (measurement.type === "FREE_CHOICE") return <div className="rounded-3xl bg-white p-5 shadow-sm"><h2 className="text-center text-sm font-extrabold uppercase tracking-[.15em] text-slate-500">{measurement.label}</h2><div className="mt-3 grid gap-2">{measurement.choices?.map((choice) => <button key={choice} onClick={() => onChange({ choice })} className={`min-h-14 rounded-xl border-2 px-3 font-bold ${value.choice === choice ? "border-pitch-600 bg-pitch-50 text-pitch-700" : "border-slate-200"}`}>{choice}</button>)}</div></div>;
  const max = measurement.total; const amount = value.value ?? 0;
  return <div className="rounded-3xl bg-white p-5 text-center shadow-sm"><h2 className="text-sm font-extrabold uppercase tracking-[.15em] text-slate-500">Skráðu árangur</h2><p className="mt-1 font-bold">{measurement.label}{max ? ` af ${max}` : ""}</p><div className="mt-4 flex items-center justify-center gap-5"><button onClick={() => onChange({ value: Math.max(0, amount - 1) })} className="grid size-16 place-items-center rounded-2xl bg-slate-100 text-3xl font-black" aria-label="Lækka um einn">−</button><output className="min-w-20 text-5xl font-black tabular-nums">{amount}</output><button onClick={() => onChange({ value: max ? Math.min(max, amount + 1) : amount + 1 })} className="grid size-16 place-items-center rounded-2xl bg-pitch-600 text-3xl font-black text-white" aria-label="Hækka um einn">+</button></div>{measurement.unit && <p className="mt-2 text-sm text-slate-500">{measurement.unit}</p>}</div>;
}
