import type { Component } from "solid-js";
import { createTimer, formatTime } from "../lib/timer";

interface Props {
  minutes: number;
}

const TimerButton: Component<Props> = (props) => {
  const timer = createTimer(props.minutes);

  return (
    <button
      class={`timer-button ${timer.running() ? "running" : ""} ${timer.remaining() === 0 ? "done" : ""}`}
      onClick={timer.toggle}
      onDblClick={timer.reset}
    >
      <span class="timer-icon">⏱️</span>
      <span class="timer-display">{formatTime(timer.remaining())}</span>
    </button>
  );
};

export default TimerButton;
