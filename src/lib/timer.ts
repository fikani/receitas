import { createSignal, onCleanup } from "solid-js";

export function createTimer(durationMin: number) {
  const totalSeconds = durationMin * 60;
  const [remaining, setRemaining] = createSignal(totalSeconds);
  const [running, setRunning] = createSignal(false);
  let interval: ReturnType<typeof setInterval> | null = null;

  function start() {
    if (running()) return;
    setRunning(true);
    interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          stop();
          playAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stop() {
    setRunning(false);
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  function reset() {
    stop();
    setRemaining(totalSeconds);
  }

  function toggle() {
    if (running()) stop();
    else start();
  }

  onCleanup(() => stop());

  return { remaining, running, start, stop, reset, toggle };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function playAlert() {
  try {
    const audio = new Audio(`${import.meta.env.BASE_URL}sounds/timer-done.mp3`);
    audio.play().catch(() => {});
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
  } catch {
    // Audio not available
  }
}
