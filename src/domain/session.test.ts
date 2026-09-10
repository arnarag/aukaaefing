import { describe, expect, it } from "vitest";
import {
  advanceSession,
  completePracticeRound,
  completeSession,
  getPracticeProgress,
  startNextPracticeRound,
  type LocalWorkoutSession,
} from "./session";

const session: LocalWorkoutSession = {
  id: "session",
  playerId: "player",
  workoutId: "w2",
  programId: "program",
  programVersion: 1,
  workoutTitle: "Sendingar í vegg",
  status: "active",
  currentDrillIndex: 0,
  completedDrillIds: [],
  results: [],
  startedAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("æfingalota", () => {
  it("færir sig áfram og geymir niðurstöðu", () => {
    const next = advanceSession(session, "d1", { drillId: "d1", measurementType: "COUNT_HIGHER_IS_BETTER", value: 12 });
    expect(next.currentDrillIndex).toBe(1);
    expect(next.results[0].value).toBe(12);
    expect(getPracticeProgress(next)).toEqual({ phase: "ready", currentRound: 1, completedRounds: 0 });
  });

  it("merkir lotu sem lokið", () => expect(completeSession(session).status).toBe("completed"));

  it("opnar eldri vistun án umferðargagna á öruggan hátt", () => {
    expect(getPracticeProgress(session)).toEqual({ phase: "ready", currentRound: 1, completedRounds: 0 });
  });

  it("heldur utan um margar umferðir án þess að klára verkefnið of snemma", () => {
    const afterFirst = completePracticeRound(session, 3);
    expect(getPracticeProgress(afterFirst)).toEqual({ phase: "rest", currentRound: 1, completedRounds: 1 });

    const second = startNextPracticeRound(afterFirst, 3);
    expect(getPracticeProgress(second)).toEqual({ phase: "ready", currentRound: 2, completedRounds: 1 });

    const afterSecond = completePracticeRound(second, 3);
    const third = startNextPracticeRound(afterSecond, 3);
    const afterThird = completePracticeRound(third, 3);
    expect(getPracticeProgress(afterThird)).toEqual({ phase: "result", currentRound: 3, completedRounds: 3 });
  });
});
