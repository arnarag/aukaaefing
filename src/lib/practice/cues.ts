let audioContext: AudioContext | undefined;

function getAudioContext() {
  if (typeof window === "undefined") return undefined;
  const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return undefined;
  audioContext ??= new AudioContextClass();
  return audioContext;
}

export async function unlockPracticeAudio() {
  const context = getAudioContext();
  if (!context) return;
  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      // Audio cues are optional; the visual timer remains authoritative.
    }
  }
}

function beep(frequency: number, startOffset: number, duration: number) {
  const context = getAudioContext();
  if (!context || context.state !== "running") return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + startOffset;
  const end = start + duration;

  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.16, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
}

export function playPracticeCue(kind: "start" | "finish") {
  if (kind === "start") {
    beep(880, 0, 0.12);
    return;
  }
  beep(740, 0, 0.12);
  beep(980, 0.18, 0.18);
}

export function vibratePracticeCue(kind: "start" | "finish") {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(kind === "start" ? 80 : [120, 70, 180]);
}
