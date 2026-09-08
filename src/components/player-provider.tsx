"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
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

  const applyPlayers = useCallback((nextPlayers: Player[]) => {
    const available = nextPlayers.length > 0 ? nextPlayers : fixturePlayers;
    setPlayers(available);
    const storedId = localStorage.getItem(PLAYER_STORAGE_KEY);
    setPlayer(available.find((candidate) => candidate.id === storedId));
  }, []);

  const refreshPlayers = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setSignedIn(false);
      applyPlayers(fixturePlayers);
      return;
    }
    const { data } = await client.auth.getSession();
    const hasSession = Boolean(data.session);
    setSignedIn(hasSession);
    if (!hasSession) {
      applyPlayers(fixturePlayers);
      return;
    }
    const persisted = await listPlayers();
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
