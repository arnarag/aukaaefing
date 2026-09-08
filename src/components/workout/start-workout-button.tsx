"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Workout } from "@/content/schema";
import { fourWeekProgram } from "@/content/programs/four-week";
import { usePlayer } from "@/components/player-provider";
import { getActiveSession, saveSession } from "@/lib/offline/workout-db";
import { newSession } from "@/domain/session";

export function StartWorkoutButton({ workout }: { workout: Workout }) {
  const { player } = usePlayer(); const router = useRouter(); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const start = async () => {
    if (!player || busy) return; setBusy(true);
    try {
      const existing = await getActiveSession(player.id);
      if (existing) { setMessage("Þú átt æfingu í gangi. Hún opnast núna."); router.push("/aefing/virk"); return; }
      await saveSession(newSession(player.id, workout.id, workout.title, fourWeekProgram.id, fourWeekProgram.version));
      router.push("/aefing/virk");
    } catch { setMessage("Ekki tókst að vista æfinguna á tækinu. Reyndu aftur."); setBusy(false); }
  };
  return <><button onClick={start} disabled={busy} className="min-h-16 w-full rounded-2xl bg-pitch-600 px-5 text-xl font-black text-white shadow-lg disabled:opacity-60">{busy ? "RÆSI ÆFINGU…" : "BYRJA"}</button>{message && <p className="mt-2 text-center text-sm font-bold" role="status">{message}</p>}</>;
}
