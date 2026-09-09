import { beforeEach, describe, expect, it, vi } from "vitest";

const single = vi.fn();
const selectAfterWrite = vi.fn(() => ({ single }));
const eq = vi.fn(() => ({ select: selectAfterWrite }));
const update = vi.fn((payload: Record<string, unknown>) => ({ payload, eq }));
const insert = vi.fn((payload: Record<string, unknown>) => ({ payload, select: selectAfterWrite }));
const from = vi.fn(() => ({ insert, update }));

vi.mock("./client", () => ({
  getSupabaseBrowserClient: () => ({ from }),
}));

import { createPlayer, updatePlayer } from "./player-repository";

describe("Supabase player repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    single.mockResolvedValue({
      data: {
        id: "player-1",
        name: "Guðmundur",
        avatar_key: "keeper",
        birth_year: 2018,
        preferred_foot: "right",
        archived_at: null,
      },
      error: null,
    });
  });

  it("never sends family_id from the browser when creating a player", async () => {
    await createPlayer({ name: "Guðmundur", birthYear: 2018, preferredFoot: "right" });

    expect(from).toHaveBeenCalledWith("players");
    expect(insert).toHaveBeenCalledTimes(1);
    const payload = insert.mock.calls[0]?.[0];
    expect(payload).toEqual({
      name: "Guðmundur",
      avatar_key: null,
      birth_year: 2018,
      preferred_foot: "right",
    });
    expect(payload).not.toHaveProperty("family_id");
  });

  it("does not clear an existing avatar when an edit omits avatarKey", async () => {
    await updatePlayer("player-1", { name: "Guðmundur", birthYear: 2018, preferredFoot: "right" });

    expect(update).toHaveBeenCalledTimes(1);
    const payload = update.mock.calls[0]?.[0];
    expect(payload).toEqual({
      name: "Guðmundur",
      birth_year: 2018,
      preferred_foot: "right",
    });
    expect(payload).not.toHaveProperty("avatar_key");
  });
});
