import type { MeasurementType } from "@/content/schema";

export type DrillResult = {
  drillId: string;
  value?: number;
  choice?: string;
  measurementType: MeasurementType;
};

export type PracticePhase = "ready" | "countdown" | "active" | "paused" | "rest" | "result";

export type PracticeProgress = {
  phase: PracticePhase;
  currentRound: number;
  completedRounds: number;
};

export type LocalWorkoutSession = {
  id: string;
  playerId: string;
  workoutId: string;
  programId: string;
  programVersion: number;
  workoutTitle: string;
  status: "active" | "completed";
  currentDrillIndex: number;
  completedDrillIds: string[];
  results: DrillResult[];
  practice?: PracticeProgress;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
};

const initialPracticeProgress = (): PracticeProgress => ({
  phase: "ready",
  currentRound: 1,
  completedRounds: 0,
});

const touched = (session: LocalWorkoutSession, practice: PracticeProgress): LocalWorkoutSession => ({
  ...session,
  practice,
  updatedAt: new Date().toISOString(),
});

export function getPracticeProgress(session: LocalWorkoutSession): PracticeProgress {
  const saved = session.practice;
  if (!saved) return initialPracticeProgress();

  return {
    phase: saved.phase ?? "ready",
    currentRound: Math.max(1, saved.currentRound ?? 1),
    completedRounds: Math.max(0, saved.completedRounds ?? 0),
  };
}

export function completePracticeRound(session: LocalWorkoutSession, totalRounds: number): LocalWorkoutSession {
  const saved = getPracticeProgress(session);
  const currentRound = Math.min(Math.max(saved.currentRound, 1), totalRounds);
  const completedRounds = Math.min(totalRounds, Math.max(saved.completedRounds, currentRound));

  return touched(session, {
    currentRound,
    completedRounds,
    phase: completedRounds >= totalRounds ? "result" : "rest",
  });
}

export function startNextPracticeRound(session: LocalWorkoutSession, totalRounds: number): LocalWorkoutSession {
  const saved = getPracticeProgress(session);
  const currentRound = Math.min(totalRounds, Math.max(saved.currentRound, saved.completedRounds) + 1);

  return touched(session, {
    currentRound,
    completedRounds: Math.min(saved.completedRounds, totalRounds),
    phase: "ready",
  });
}

export function newSession(playerId: string, workoutId: string, workoutTitle: string, programId: string, programVersion: number): LocalWorkoutSession {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    playerId,
    workoutId,
    workoutTitle,
    programId,
    programVersion,
    status: "active",
    currentDrillIndex: 0,
    completedDrillIds: [],
    results: [],
    practice: initialPracticeProgress(),
    startedAt: now,
    updatedAt: now,
  };
}

export function advanceSession(session: LocalWorkoutSession, drillId: string, result?: DrillResult): LocalWorkoutSession {
  return {
    ...session,
    currentDrillIndex: session.currentDrillIndex + 1,
    completedDrillIds: [...new Set([...session.completedDrillIds, drillId])],
    results: result ? [...session.results.filter((item) => item.drillId !== drillId), result] : session.results,
    practice: initialPracticeProgress(),
    updatedAt: new Date().toISOString(),
  };
}

export function completeSession(session: LocalWorkoutSession): LocalWorkoutSession {
  const now = new Date().toISOString();
  return { ...session, status: "completed", completedAt: now, updatedAt: now };
}
