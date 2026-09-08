import type { Player, PreferredFoot } from "@/domain/players";
import { playerPresentation } from "@/domain/players";
import { getSupabaseBrowserClient } from "./client";

export type PlayerInput = {
  name: string;
  avatarKey?: string | null;
  birthYear?: number | null;
  preferredFoot?: PreferredFoot | null;
};

type PlayerRow = {
  id: string;
  name: string;
  avatar_key: string | null;
  birth_year: number | null;
  preferred_foot: PreferredFoot | null;
  archived_at: string | null;
};

function toPlayer(row: PlayerRow): Player {
  const presentation = playerPresentation(row.avatar_key);
  return {
    id: row.id,
    name: row.name,
    avatar: presentation.avatar,
    color: presentation.color,
    avatarKey: row.avatar_key,
    birthYear: row.birth_year,
    preferredFoot: row.preferred_foot,
    archivedAt: row.archived_at,
    persisted: true,
  };
}

function requireClient() {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase er ekki stillt.");
  return client;
}

export async function listPlayers(): Promise<Player[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("players")
    .select("id,name,avatar_key,birth_year,preferred_foot,archived_at")
    .is("archived_at", null)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as PlayerRow[]).map(toPlayer);
}

export async function createPlayer(input: PlayerInput): Promise<Player> {
  const client = requireClient();
  const { data, error } = await client
    .from("players")
    .insert({
      name: input.name.trim(),
      avatar_key: input.avatarKey ?? null,
      birth_year: input.birthYear ?? null,
      preferred_foot: input.preferredFoot ?? null,
    })
    .select("id,name,avatar_key,birth_year,preferred_foot,archived_at")
    .single();
  if (error) throw error;
  return toPlayer(data as PlayerRow);
}

export async function updatePlayer(id: string, input: PlayerInput): Promise<Player> {
  const client = requireClient();
  const updatePayload: Record<string, unknown> = {
    name: input.name.trim(),
    birth_year: input.birthYear ?? null,
    preferred_foot: input.preferredFoot ?? null,
  };
  if (Object.prototype.hasOwnProperty.call(input, "avatarKey")) {
    updatePayload.avatar_key = input.avatarKey ?? null;
  }

  const { data, error } = await client
    .from("players")
    .update(updatePayload)
    .eq("id", id)
    .select("id,name,avatar_key,birth_year,preferred_foot,archived_at")
    .single();
  if (error) throw error;
  return toPlayer(data as PlayerRow);
}

export async function archivePlayer(id: string) {
  const client = requireClient();
  const { error } = await client.from("players").update({ archived_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}
