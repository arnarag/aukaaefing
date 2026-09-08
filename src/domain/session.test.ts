import { describe, expect, it } from "vitest";
import { advanceSession, completeSession, type LocalWorkoutSession } from "./session";

const session: LocalWorkoutSession = {
  id: "session", playerId: "player", workoutId: "w2", programId: "program", programVersion: 1,
  workoutTitle: "Sendingar í vegg", status: "active", currentDrillIndex: 0, completedDrillIds: [], results: [],
  startedAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("æfingalota", () => {
  it("færir sig áfram og geymir niðurstöðu", () => {
    const next = advanceSession(session, "d1", { drillId: "d1", measurementType: "COUNT_HIGHER_IS_BETTER", value: 12 });
    expect(next.currentDrillIndex).toBe(1);
    expect(next.results[0].value).toBe(12);
  });

  it("merkir lotu sem lokið", () => expect(completeSession(session).status).toBe("completed"));
});
