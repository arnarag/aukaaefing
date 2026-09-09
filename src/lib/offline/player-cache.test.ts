import { describe, expect, it } from "vitest";
import type { Player } from "@/domain/players";
import { readCachedPersistedPlayers, writeCachedPersistedPlayers } from "./player-cache";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

const player: Player = {
  id: "player-1",
  name: "Guðmundur",
  avatar: "⚽",
  color: "bg-emerald-100",
  persisted: true,
};

describe("persisted player cache", () => {
  it("partitions cached players by authenticated user", () => {
    const storage = memoryStorage();
    writeCachedPersistedPlayers("user-a", [player], storage);

    expect(readCachedPersistedPlayers("user-a", storage)).toEqual([player]);
    expect(readCachedPersistedPlayers("user-b", storage)).toEqual([]);
  });

  it("does not cache fixture players", () => {
    const storage = memoryStorage();
    writeCachedPersistedPlayers("user-a", [{ ...player, persisted: false }], storage);

    expect(readCachedPersistedPlayers("user-a", storage)).toEqual([]);
  });

  it("ignores malformed cached data", () => {
    const storage = memoryStorage();
    storage.setItem("aukaaefing:persisted-players:user-a", "not-json");

    expect(readCachedPersistedPlayers("user-a", storage)).toEqual([]);
  });
});
