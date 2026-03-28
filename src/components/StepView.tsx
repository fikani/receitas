import { Component, For, Show } from "solid-js";
import type { Passo } from "../types";
import TipCard from "./TipCard";
import TimerButton from "./TimerButton";

interface Props {
  passo: Passo;
  multiplicador: number;
}

const FOGO_LABEL: Record<string, string> = {
  baixo: "🔥 Fogo baixo",
  medio: "🔥🔥 Fogo médio",
  alto: "🔥🔥🔥 Fogo alto",
};

const StepView: Component<Props> = (props) => {
  return (
    <div class="step-view">
      <div class="step-header">
        <Show when={props.passo.metodo}>
          <span class="step-metodo">{props.passo.metodo}</span>
        </Show>
        <h2 class="step-titulo">{props.passo.titulo}</h2>
      </div>

      <p class="step-descricao">{props.passo.descricao}</p>

      <Show when={props.passo.fogo}>
        <div class="step-fogo">{FOGO_LABEL[props.passo.fogo!]}</div>
      </Show>

      <Show when={props.passo.temperatura_c}>
        <div class="step-temp">🌡️ {props.passo.temperatura_c}°C</div>
      </Show>

      <For each={props.passo.dicas}>
        {(dica) => <TipCard dica={dica} />}
      </For>

      <Show when={props.passo.timer_min}>
        <div class="step-timer-row">
          <TimerButton minutes={props.passo.timer_min!} />
        </div>
      </Show>
    </div>
  );
};

export default StepView;
