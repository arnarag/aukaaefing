"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { fixturePlayers, PLAYER_STORAGE_KEY, type Player } from "@/domain/players";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { listPlayers } from "@/lib/supabase/player-repository";

type PlayerContextValue = {
  player?: Player;
  players: Player[];
  ready: boolean;
  signedIn: boolean;
  supabaseConfigured: boolean;
  selectPlayer: (id: string) => void;
  refreshPlayers: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextValue>({
  players: fixturePlayers,
  ready: false,
  signedIn: false,
  supabaseConfigured: isSupabaseConfigured,
  selectPlayer: () => undefined,
  refreshPlayers: async () => undefined,
});

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<Player>();
  const [players, setPlayers] = useState<Player[]>(fixturePlayers);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const refreshVersion = useRef(0);

  const applyPlayers = useCallback((nextPlayers: Player[]) => {
    setPlayers(nextPlayers);
    const storedId = localStorage.getItem(PLAYER_STORAGE_KEY);
    setPlayer(nextPlayers.find((candidate) => candidate.id === storedId));
  }, []);

  const refreshPlayers = useCallback(async () => {
    const requestVersion = ++refreshVersion.current;
    const client = getSupabaseBrowserClient();

    if (!client) {
      if (requestVersion !== refreshVersion.current) return;
      setSignedIn(false);
      applyPlayers(fixturePlayers);
      return;
    }

    const { data } = await client.auth.getSession();
    if (requestVersion !== refreshVersion.current) return;

    const userId = data.session?.user.id;
    if (!userId) {
      setSignedIn(false);
      applyPlayers(fixturePlayers);
      return;
    }

    setSignedIn(true);
    applyPlayers([]);

    const persisted = await listPlayers();
    const currentSession = (await client.auth.getSession()).data.session;
    if (requestVersion !== refreshVersion.current || currentSession?.user.id !== userId) return;

    applyPlayers(persisted);
  }, [applyPlayers]);

  useEffect(() => {
    let active = true;
    const client = getSupabaseBrowserClient();

    const initialize = async () => {
      try {
        await refreshPlayers();
      } finally {
        if (active) setReady(true);
      }
    };
    void initialize();

    if (!client) return () => { active = false; };
    const { data: subscription } = client.auth.onAuthStateChange(() => {
      if (active) void refreshPlayers();
    });
    return () => {
      active = false;
      refreshVersion.current += 1;
      subscription.subscription.unsubscribe();
    };
  }, [refreshPlayers]);

  const selectPlayer = (id: string) => {
    localStorage.setItem(PLAYER_STORAGE_KEY, id);
    setPlayer(players.find((candidate) => candidate.id === id));
  };

  return (
    <PlayerContext.Provider
      value={{ player, players, ready, signedIn, supabaseConfigured: isSupabaseConfigured, selectPlayer, refreshPlayers }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
