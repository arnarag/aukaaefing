export function secondsRemaining(endAt: number, now: number) { return Math.max(0, Math.ceil((endAt - now) / 1000)); }
export function formatTime(seconds: number) { const safe = Math.max(0, seconds); return `${Math.floor(safe / 60).toString().padStart(2, "0")}:${(safe % 60).toString().padStart(2, "0")}`; }
