import type { LocalWorkoutSession } from "./session";

export function reykjavikIsoWeekKey(value: string | Date) {
  const date = new Date(value);
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en", { timeZone: "Europe/Reykjavik", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date).map(({ type, value: part }) => [type, part]));
  const current = new Date(`${parts.year}-${parts.month}-${parts.day}T12:00:00Z`);
  const weekday = current.getUTCDay() || 7;
  current.setUTCDate(current.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((current.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return `${current.getUTCFullYear()}-W${week.toString().padStart(2, "0")}`;
}

export function completedMainWorkoutsThisWeek(sessions: LocalWorkoutSession[], shortWorkoutIds: Set<string>, now = new Date()) {
  const key = reykjavikIsoWeekKey(now);
  return sessions.filter((session) => session.status === "completed" && session.completedAt && !shortWorkoutIds.has(session.workoutId) && reykjavikIsoWeekKey(session.completedAt) === key).length;
}
