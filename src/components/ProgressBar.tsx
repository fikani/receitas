import type { Component } from "solid-js";

interface Props {
  current: number;
  total: number;
}

const ProgressBar: Component<Props> = (props) => {
  const percent = () => ((props.current + 1) / props.total) * 100;

  return (
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" style={{ width: `${percent()}%` }} />
      </div>
      <span class="progress-text">
        {props.current + 1} / {props.total}
      </span>
    </div>
  );
};

export default ProgressBar;
