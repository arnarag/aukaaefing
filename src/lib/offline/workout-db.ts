import { openDB, type DBSchema } from "idb";
import type { LocalWorkoutSession } from "@/domain/session";

interface WorkoutDatabase extends DBSchema {
  sessions: {
    key: string;
    value: LocalWorkoutSession;
    indexes: { "by-player": string; "by-status": string };
  };
}

const database = () => openDB<WorkoutDatabase>("aukaaefing-local", 1, {
  upgrade(db) {
    const sessions = db.createObjectStore("sessions", { keyPath: "id" });
    sessions.createIndex("by-player", "playerId");
    sessions.createIndex("by-status", "status");
  },
});

export async function saveSession(session: LocalWorkoutSession) {
  return (await database()).put("sessions", session);
}

export async function getActiveSession(playerId: string) {
  const sessions = await (await database()).getAllFromIndex("sessions", "by-player", playerId);
  return sessions.find((session) => session.status === "active") ?? null;
}

export async function getLatestCompletedSession(playerId: string) {
  const sessions = await (await database()).getAllFromIndex("sessions", "by-player", playerId);
  return sessions.filter((session) => session.status === "completed").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
}

export async function getCompletedSessions(playerId: string) {
  const sessions = await (await database()).getAllFromIndex("sessions", "by-player", playerId);
  return sessions.filter((session) => session.status === "completed");
}
