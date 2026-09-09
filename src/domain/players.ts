export type PreferredFoot = "left" | "right" | "both";

export type Player = {
  id: string;
  name: string;
  avatar: string;
  color: string;
  avatarKey?: string | null;
  birthYear?: number | null;
  preferredFoot?: PreferredFoot | null;
  archivedAt?: string | null;
  persisted?: boolean;
};

export const fixturePlayers: Player[] = [
  { id: "player-gudmundur", name: "Guðmundur", avatar: "⚽", color: "bg-amber-100", persisted: false },
  { id: "player-bjorn", name: "Björn", avatar: "🧤", color: "bg-sky-100", persisted: false },
];

export const legacyFixturePlayers: Player[] = [
  { id: "player-elin", name: "Elín", avatar: "⚽", color: "bg-amber-100", persisted: false },
  { id: "player-kari", name: "Kári", avatar: "🧤", color: "bg-sky-100", persisted: false },
];

export const PLAYER_STORAGE_KEY = "aukaaefing:selected-player";

export function getFixturePlayer(id: string | null) {
  return [...fixturePlayers, ...legacyFixturePlayers].find((player) => player.id === id);
}

export function playerPresentation(avatarKey?: string | null) {
  if (avatarKey === "keeper") return { avatar: "🧤", color: "bg-sky-100" };
  if (avatarKey === "star") return { avatar: "⭐", color: "bg-yellow-100" };
  return { avatar: "⚽", color: "bg-emerald-100" };
}
