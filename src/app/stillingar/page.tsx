"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { usePlayer } from "@/components/player-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { archivePlayer, createPlayer, updatePlayer } from "@/lib/supabase/player-repository";
import type { Player, PreferredFoot } from "@/domain/players";

export default function SettingsPage() {
  const { players, signedIn, supabaseConfigured, refreshPlayers } = usePlayer();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Player>();
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [preferredFoot, setPreferredFoot] = useState<PreferredFoot | "">("");

  if (!supabaseConfigured) return <Shell><p>Supabase er ekki stillt fyrir þessa útgáfu.</p></Shell>;

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setBusy(true); setMessage("");
    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/stillingar` },
    });
    setBusy(false);
    setMessage(error ? "Ekki tókst að senda innskráningartengil." : "Innskráningartengill hefur verið sendur í tölvupósti.");
  };

  const signOut = async () => {
    const client = getSupabaseBrowserClient();
    await client?.auth.signOut();
    await refreshPlayers();
  };

  const resetForm = () => {
    setEditing(undefined); setName(""); setBirthYear(""); setPreferredFoot("");
  };

  const startEdit = (player: Player) => {
    setEditing(player);
    setName(player.name);
    setBirthYear(player.birthYear?.toString() ?? "");
    setPreferredFoot(player.preferredFoot ?? "");
  };

  const savePlayer = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true); setMessage("");
    try {
      const input = {
        name,
        birthYear: birthYear ? Number(birthYear) : null,
        preferredFoot: preferredFoot || null,
      };
      if (editing) await updatePlayer(editing.id, input);
      else await createPlayer(input);
      await refreshPlayers();
      resetForm();
    } catch {
      setMessage("Ekki tókst að vista leikmann.");
    } finally {
      setBusy(false);
    }
  };

  const removePlayer = async (player: Player) => {
    if (!window.confirm(`Fjarlægja ${player.name}?`)) return;
    setBusy(true);
    try {
      await archivePlayer(player.id);
      await refreshPlayers();
      if (editing?.id === player.id) resetForm();
    } finally { setBusy(false); }
  };

  if (!signedIn) return <Shell>
    <h1 className="text-3xl font-black">Foreldrar</h1>
    <p className="mt-2 text-slate-600">Skráðu þig inn með tölvupósti til að vista leikmenn á fjölskyldureikningnum.</p>
    <form onSubmit={signIn} className="mt-6 space-y-4">
      <label className="block font-bold">Tölvupóstur<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4" /></label>
      <button disabled={busy} className="min-h-12 w-full rounded-xl bg-pitch-600 px-4 font-black text-white disabled:opacity-50">SENDA INNSKRÁNINGARTENGIL</button>
    </form>
    {message && <p className="mt-4 rounded-xl bg-white p-4">{message}</p>}
  </Shell>;

  return <Shell>
    <div className="flex items-center justify-between gap-4"><h1 className="text-3xl font-black">Leikmenn</h1><button onClick={signOut} className="rounded-xl bg-white px-4 py-3 text-sm font-bold">SKRÁ ÚT</button></div>
    <div className="mt-6 space-y-3">
      {players.filter((player) => player.persisted).map((player) => <div key={player.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
        <div><div className="text-lg font-black">{player.name}</div><div className="text-sm text-slate-500">{player.birthYear ? `Fædd/ur ${player.birthYear}` : "Fæðingarár ekki skráð"}</div></div>
        <div className="flex gap-2"><button onClick={() => startEdit(player)} className="rounded-lg bg-pitch-50 px-3 py-2 text-sm font-bold text-pitch-700">BREYTA</button><button onClick={() => removePlayer(player)} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold">FJARLÆGJA</button></div>
      </div>)}
    </div>
    <form onSubmit={savePlayer} className="mt-8 space-y-4 rounded-3xl bg-white p-5 shadow-card">
      <h2 className="text-xl font-black">{editing ? `Breyta ${editing.name}` : "Bæta við leikmanni"}</h2>
      <label className="block font-bold">Nafn<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4" /></label>
      <label className="block font-bold">Fæðingarár<input inputMode="numeric" value={birthYear} onChange={(event) => setBirthYear(event.target.value.replace(/\D/g, "").slice(0, 4))} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4" /></label>
      <label className="block font-bold">Fótur<select value={preferredFoot} onChange={(event) => setPreferredFoot(event.target.value as PreferredFoot | "")} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4"><option value="">Ekki skráð</option><option value="right">Hægri</option><option value="left">Vinstri</option><option value="both">Báðir</option></select></label>
      <div className="flex gap-3"><button disabled={busy} className="min-h-12 flex-1 rounded-xl bg-pitch-600 px-4 font-black text-white disabled:opacity-50">VISTA</button>{editing && <button type="button" onClick={resetForm} className="min-h-12 rounded-xl bg-slate-100 px-4 font-bold">HÆTTA VIÐ</button>}</div>
    </form>
    {message && <p className="mt-4 rounded-xl bg-white p-4">{message}</p>}
  </Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto min-h-dvh max-w-lg bg-pitch-50 px-5 py-8 text-ink">
    <div className="mb-8 flex items-center justify-between"><Link href="/leikmenn" className="text-xl font-black">AUKA<span className="text-pitch-600">ÆFING</span></Link><Link href="/leikmenn" className="rounded-full bg-white px-4 py-2 text-sm font-bold">TIL BAKA</Link></div>
    {children}
  </main>;
}
