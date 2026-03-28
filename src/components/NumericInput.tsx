import type { Component } from "solid-js";

interface Props {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

const NumericInput: Component<Props> = (props) => {
  const decrement = () => {
    const next = props.value - 1;
    if (props.min !== undefined && next < props.min) return;
    props.onChange(next);
  };

  const increment = () => {
    const next = props.value + 1;
    if (props.max !== undefined && next > props.max) return;
    props.onChange(next);
  };

  return (
    <div class="numeric-input">
      <span class="numeric-label">{props.label}</span>
      <div class="numeric-controls">
        <button class="numeric-btn" onClick={decrement}>−</button>
        <span class="numeric-value">{props.value}</span>
        <button class="numeric-btn" onClick={increment}>+</button>
      </div>
    </div>
  );
};

export default NumericInput;
