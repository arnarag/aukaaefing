import type { Player } from "@/domain/players";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

const CACHE_PREFIX = "aukaaefing:persisted-players:";

function cacheKey(userId: string) {
  return `${CACHE_PREFIX}${userId}`;
}

function isCachedPlayer(value: unknown): value is Player {
  if (!value || typeof value !== "object") return false;
  const player = value as Partial<Player>;
  return typeof player.id === "string"
    && typeof player.name === "string"
    && typeof player.avatar === "string"
    && typeof player.color === "string"
    && player.persisted === true;
}

export function readCachedPersistedPlayers(userId: string, storage: StorageLike = window.localStorage): Player[] {
  try {
    const raw = storage.getItem(cacheKey(userId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCachedPlayer) : [];
  } catch {
    return [];
  }
}

export function writeCachedPersistedPlayers(userId: string, players: Player[], storage: StorageLike = window.localStorage) {
  const persisted = players.filter((player) => player.persisted === true);
  storage.setItem(cacheKey(userId), JSON.stringify(persisted));
}
