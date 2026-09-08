"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePlayer } from "./player-provider";

export function RequirePlayer({ children }: { children: React.ReactNode }) {
  const { player, ready } = usePlayer();
  const router = useRouter();
  useEffect(() => { if (ready && !player) router.replace("/leikmenn"); }, [player, ready, router]);
  if (!ready || !player) return <div className="grid min-h-[60vh] place-items-center font-bold text-pitch-700">Sæki æfinguna…</div>;
  return children;
}
