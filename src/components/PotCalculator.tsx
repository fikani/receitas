import { Component, For, Show } from "solid-js";
import type { CalculoPotes } from "../lib/calc";

interface Props {
  calculo: CalculoPotes;
  checked: boolean;
  onToggle: () => void;
  onPoteChange: (sizeMl: number) => void;
}

const POT_OPTIONS = [
  { value: 0, label: "1 por refeição" },
  { value: 500, label: "500ml" },
  { value: 750, label: "750ml" },
];

const PotCalculator: Component<Props> = (props) => {
  const quantidadeFormatada = () => {
    const g = props.calculo.quantidadeTotal;
    return g >= 1000 ? `${(g / 1000).toFixed(1)}kg` : `${Math.round(g)}g`;
  };

  return (
    <div class={`pot-card ${props.checked ? "checked" : ""}`}>
      <div class="pot-header" onClick={props.onToggle}>
        <span class="pot-check">{props.checked ? "✅" : "⬜"}</span>
        <div class="pot-info">
          <h3>{props.calculo.receitaNome}</h3>
          <p>{quantidadeFormatada()} total</p>
        </div>
      </div>

      <div class="pot-sizes">
        <For each={POT_OPTIONS}>
          {(opt) => (
            <button
              class={`pot-size-btn ${props.calculo.poteSizeMl === opt.value ? "active" : ""}`}
              onClick={() => props.onPoteChange(opt.value)}
            >
              {opt.label}
            </button>
          )}
        </For>
      </div>

      <div class="pot-result">
        <span class="pot-count">{props.calculo.numeroPotes}</span>
        <span class="pot-label">
          {props.calculo.numeroPotes === 1 ? "pote" : "potes"}
        </span>
      </div>

      <Show when={props.calculo.poteSizeMl > 0}>
        <p class="pot-instrucao">
          {props.calculo.porcoesPorPote} porção(ões) por pote
        </p>
      </Show>
    </div>
  );
};

export default PotCalculator;
