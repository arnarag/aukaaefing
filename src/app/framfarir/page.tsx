import { ChildShell } from "@/components/child-shell";
import { RequirePlayer } from "@/components/require-player";

export default function ProgressPage() { return <RequirePlayer><ChildShell><div className="pt-3"><p className="text-sm font-extrabold uppercase tracking-[.18em] text-pitch-700">Þín eigin vegferð</p><h1 className="mt-1 text-3xl font-black">Framfarir</h1><div className="mt-7 rounded-3xl bg-white p-7 text-center shadow-card"><div className="mx-auto grid size-16 place-items-center rounded-full bg-pitch-100 text-3xl">🌱</div><h2 className="mt-4 text-xl font-black">Fyrsta æfingin bíður</h2><p className="mt-2 leading-relaxed text-slate-600">Kláraðar æfingar verða vistaðar á þessu tæki. Nánari framfarir koma síðar.</p></div></div></ChildShell></RequirePlayer>; }
