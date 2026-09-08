import { describe, expect, it } from "vitest";
import { fourWeekProgram, mainWorkouts, shortWorkouts } from "./four-week";
import { trainingProgramSchema } from "../schema";

describe("fjögurra vikna æfingaáætlun", () => {
  it("stenst gagnaskemað og inniheldur allt efnið", () => {
    expect(trainingProgramSchema.safeParse(fourWeekProgram).success).toBe(true);
    expect(mainWorkouts).toHaveLength(12);
    expect(shortWorkouts).toHaveLength(3);
    expect(mainWorkouts.flatMap((workout) => workout.drills)).toHaveLength(49);
  });

  it("hefur fyrirgefanlegt vikumarkmið", () => {
    expect(fourWeekProgram.weeklyGoal).toEqual({ defaultCompletedMainWorkouts: 2, recommendedWorkoutSlots: 3 });
  });

  it("varðveitir tímabil og frjálst mælingaval", () => {
    expect(mainWorkouts.find((workout) => workout.id === "w2")?.drills[2].durationMinutes).toEqual({ min: 8, max: 10 });
    expect(mainWorkouts.find((workout) => workout.id === "w12")?.drills[4].measurement?.type).toBe("FREE_CHOICE");
  });
});
