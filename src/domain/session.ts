import type { MeasurementType } from "@/content/schema";

export type DrillResult = {
  drillId: string;
  value?: number;
  choice?: string;
  measurementType: MeasurementType;
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
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
};

export function newSession(playerId: string, workoutId: string, workoutTitle: string, programId: string, programVersion: number): LocalWorkoutSession {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(), playerId, workoutId, workoutTitle, programId, programVersion,
    status: "active", currentDrillIndex: 0, completedDrillIds: [], results: [], startedAt: now, updatedAt: now,
  };
}

export function advanceSession(session: LocalWorkoutSession, drillId: string, result?: DrillResult): LocalWorkoutSession {
  return {
    ...session,
    currentDrillIndex: session.currentDrillIndex + 1,
    completedDrillIds: [...new Set([...session.completedDrillIds, drillId])],
    results: result ? [...session.results.filter((item) => item.drillId !== drillId), result] : session.results,
    updatedAt: new Date().toISOString(),
  };
}

export function completeSession(session: LocalWorkoutSession): LocalWorkoutSession {
  const now = new Date().toISOString();
  return { ...session, status: "completed", completedAt: now, updatedAt: now };
}
