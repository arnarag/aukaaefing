import { z } from "zod";

export const measurementTypeSchema = z.enum([
  "COUNT_HIGHER_IS_BETTER",
  "TIME_LOWER_IS_BETTER",
  "SUCCESS_OUT_OF_TOTAL",
  "REPETITIONS_WITHOUT_ERROR",
  "COMPLETED",
  "FREE_CHOICE",
]);

const durationSchema = z.object({ min: z.number().int().positive(), max: z.number().int().positive() }).refine(
  ({ min, max }) => min <= max,
  "Lágmarkslengd má ekki vera meiri en hámarkslengd",
);

const measurementSchema = z.object({
  type: measurementTypeSchema,
  label: z.string().min(1),
  unit: z.string().min(1).optional(),
  total: z.number().int().positive().optional(),
  comparisonKey: z.string().min(1).optional(),
  choices: z.array(z.string().min(1)).optional(),
}).superRefine((measurement, context) => {
  if (measurement.type === "SUCCESS_OUT_OF_TOTAL" && !measurement.total) {
    context.addIssue({ code: "custom", message: "Hlutfallsmæling þarf heildarfjölda" });
  }
  if (measurement.type === "FREE_CHOICE" && !measurement.choices?.length) {
    context.addIssue({ code: "custom", message: "Frjálst val þarf valkosti" });
  }
});

export const drillSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  instructions: z.string().min(1),
  durationMinutes: durationSchema.optional(),
  durationSeconds: z.number().int().positive().optional(),
  equipment: z.array(z.string().min(1)).default([]),
  categories: z.array(z.string().min(1)).min(1),
  interval: z.object({ workSeconds: z.number().int().positive(), restSeconds: z.number().int().positive().optional(), rounds: z.number().int().positive() }).optional(),
  measurement: measurementSchema.optional(),
});

export const workoutSchema = z.object({
  id: z.string().min(1),
  weekNumber: z.number().int().min(0).max(4),
  order: z.number().int().positive(),
  title: z.string().min(1),
  durationMinutes: durationSchema,
  equipment: z.array(z.string().min(1)).min(1),
  coachingPoint: z.string().min(1).optional(),
  isShortSession: z.boolean().default(false),
  choiceInstructions: z.string().min(1).optional(),
  drills: z.array(drillSchema).min(1),
});

export const trainingProgramSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  version: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  targetAge: z.object({ min: z.literal(10), max: z.literal(12) }),
  numberOfWeeks: z.literal(4),
  weeklyGoal: z.object({ defaultCompletedMainWorkouts: z.number().int().positive(), recommendedWorkoutSlots: z.number().int().positive() }),
  weeks: z.array(z.object({ number: z.number().int().min(1).max(4), title: z.string().min(1), focus: z.string().min(1) })).length(4),
  workouts: z.array(workoutSchema).length(15),
}).superRefine((program, context) => {
  const ids = new Set<string>();
  for (const workout of program.workouts) {
    if (ids.has(workout.id)) context.addIssue({ code: "custom", message: `Tvítekið æfingaauðkenni: ${workout.id}` });
    ids.add(workout.id);
    for (const drill of workout.drills) {
      if (ids.has(drill.id)) context.addIssue({ code: "custom", message: `Tvítekið æfingaauðkenni: ${drill.id}` });
      ids.add(drill.id);
    }
  }
  const main = program.workouts.filter((workout) => !workout.isShortSession);
  if (main.length !== 12) context.addIssue({ code: "custom", message: "Verkefnið þarf að innihalda 12 aðalæfingar" });
  if (program.weeklyGoal.defaultCompletedMainWorkouts > program.weeklyGoal.recommendedWorkoutSlots) {
    context.addIssue({ code: "custom", message: "Vikumarkmið má ekki fara yfir ráðlagða æfingatíma" });
  }
});

export type TrainingProgram = z.infer<typeof trainingProgramSchema>;
export type Workout = z.infer<typeof workoutSchema>;
export type Drill = z.infer<typeof drillSchema>;
export type MeasurementType = z.infer<typeof measurementTypeSchema>;
