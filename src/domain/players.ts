export type FixturePlayer = {
  id: string;
  name: string;
  avatar: string;
  color: string;
};

export const fixturePlayers: FixturePlayer[] = [
  { id: "player-elin", name: "Elín", avatar: "⚽", color: "bg-amber-100" },
  { id: "player-kari", name: "Kári", avatar: "🧤", color: "bg-sky-100" },
];

export const PLAYER_STORAGE_KEY = "aukaaefing:selected-player";

export function getFixturePlayer(id: string | null) {
  return fixturePlayers.find((player) => player.id === id);
}
