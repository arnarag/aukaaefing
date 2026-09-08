"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime, secondsRemaining } from "@/domain/timer";

export function DrillTimer({ initialSeconds }: { initialSeconds: number }) {
  const [remaining, setRemaining] = useState(initialSeconds); const [running, setRunning] = useState(false); const endAt = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!running) return;
    const tick = () => { const next = secondsRemaining(endAt.current ?? Date.now(), Date.now()); setRemaining(next); if (next === 0) setRunning(false); };
    tick(); const id = window.setInterval(tick, 250); return () => window.clearInterval(id);
  }, [running]);
  const toggle = () => { if (running) { setRunning(false); } else { endAt.current = Date.now() + remaining * 1000; setRunning(true); } };
  const reset = () => { setRunning(false); setRemaining(initialSeconds); };
  return <div className="rounded-3xl bg-ink p-5 text-center text-white"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-pitch-100">Tími</p><div className="my-2 font-mono text-6xl font-black tabular-nums" aria-live="polite">{formatTime(remaining)}</div><div className="mt-4 grid grid-cols-2 gap-3"><button onClick={toggle} className="min-h-14 rounded-xl bg-sun font-black text-ink">{running ? "PÁSA" : remaining === initialSeconds ? "BYRJA TÍMA" : "HALDA ÁFRAM"}</button><button onClick={reset} className="min-h-14 rounded-xl border border-white/30 font-bold">BYRJA AFTUR</button></div></div>;
}
