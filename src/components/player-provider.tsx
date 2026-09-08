"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getFixturePlayer, PLAYER_STORAGE_KEY, type FixturePlayer } from "@/domain/players";

type PlayerContextValue = { player?: FixturePlayer; ready: boolean; selectPlayer: (id: string) => void };
const PlayerContext = createContext<PlayerContextValue>({ ready: false, selectPlayer: () => undefined });

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<FixturePlayer>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPlayer(getFixturePlayer(localStorage.getItem(PLAYER_STORAGE_KEY)));
    setReady(true);
  }, []);

  const selectPlayer = (id: string) => {
    localStorage.setItem(PLAYER_STORAGE_KEY, id);
    setPlayer(getFixturePlayer(id));
  };

  return <PlayerContext.Provider value={{ player, ready, selectPlayer }}>{children}</PlayerContext.Provider>;
}

export const usePlayer = () => useContext(PlayerContext);
