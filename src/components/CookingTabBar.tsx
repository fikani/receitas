import { Component, For } from "solid-js";
import { receitaPorId } from "../store/recipes";

interface TabInfo {
  receitaId: string;
  concluida: boolean;
}

interface Props {
  receitas: TabInfo[];
  abaAtiva: number;
  onMudarAba: (index: number) => void;
  onVoltar: () => void;
}

const CookingTabBar: Component<Props> = (props) => {
  return (
    <div class="cooking-tab-bar">
      <button class="cooking-tab-back" onClick={props.onVoltar}>
        ←
      </button>
      <div class="cooking-tabs">
        <For each={props.receitas}>
          {(tab, i) => {
            const nome = () => receitaPorId(tab.receitaId)?.nome ?? tab.receitaId;
            return (
              <button
                class={`cooking-tab ${i() === props.abaAtiva ? "active" : ""} ${tab.concluida ? "done" : ""}`}
                onClick={() => props.onMudarAba(i())}
              >
                <span class="cooking-tab-name">{nome()}</span>
                {tab.concluida && <span class="cooking-tab-check"> ✅</span>}
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
};

export default CookingTabBar;
