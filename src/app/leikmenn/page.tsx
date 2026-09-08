"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/components/player-provider";

export default function PlayerSelectionPage() {
  const router = useRouter();
  const { players, selectPlayer, ready, signedIn, supabaseConfigured } = usePlayer();
  const select = (id: string) => { selectPlayer(id); router.push("/heim"); };
  const emptyAuthenticatedFamily = ready && signedIn && players.length === 0;

  return <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-8 text-ink">
    <div className="mb-10 flex items-center justify-between">
      <div className="text-xl font-black">AUKA<span className="text-pitch-600">ÆFING</span></div>
      {supabaseConfigured && <Link href="/stillingar" className="rounded-full bg-white px-4 py-2 text-sm font-extrabold shadow-sm">FORELDRAR</Link>}
    </div>
    <div className="mb-8">
      <p className="mb-2 text-sm font-extrabold uppercase tracking-[.18em] text-pitch-700">Velkomin</p>
      <h1 className="text-4xl font-black tracking-tight">Hver æfir?</h1>
      <p className="mt-3 text-lg text-slate-600">Veldu þinn leikmann og byrjaðu.</p>
    </div>
    {!ready ? <div className="rounded-3xl bg-white p-6 text-center font-bold shadow-card">Sæki leikmenn…</div> :
    emptyAuthenticatedFamily ? <div className="rounded-3xl bg-white p-6 text-center shadow-card">
      <h2 className="text-xl font-black">Enginn leikmaður skráður</h2>
      <p className="mt-2 text-slate-600">Foreldri þarf að bæta við leikmanni áður en æfing getur hafist.</p>
      <Link href="/stillingar" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-pitch-600 px-5 font-black text-white">BÆTA VIÐ LEIKMANNI</Link>
    </div> :
    <div className="grid grid-cols-2 gap-4">
      {players.map((player) => <button key={player.id} onClick={() => select(player.id)} className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-3xl bg-white p-5 shadow-card transition active:scale-[.98]" aria-label={`Velja ${player.name}`}>
        <span className={`grid size-24 place-items-center rounded-full text-5xl ${player.color}`} aria-hidden="true">{player.avatar}</span>
        <span className="text-2xl font-black">{player.name}</span>
      </button>)}
    </div>}
    <div className="mt-auto rounded-2xl border border-pitch-100 bg-white/70 p-4 text-center text-sm text-slate-600">
      {supabaseConfigured && signedIn ? "Leikmenn eru vistaðir á fjölskyldureikningnum." : "Prufuleikmenn eru aðeins vistaðir á þessu tæki."}
    </div>
  </main>;
}
