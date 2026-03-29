import { Component, For, Show, createSignal } from "solid-js";
import type { MiseEnPlaceItem } from "../lib/mise-en-place";

interface Props {
  items: MiseEnPlaceItem[];
  title: string;
  collapsible?: boolean;
}

const MiseEnPlaceList: Component<Props> = (props) => {
  const [aberto, setAberto] = createSignal(!props.collapsible);

  return (
    <Show when={props.items.length > 0}>
      <div class="mise-section">
        <button
          class={`mise-header ${props.collapsible ? "collapsible" : ""}`}
          onClick={() => props.collapsible && setAberto(!aberto())}
        >
          <h2 class="mise-title">{props.title}</h2>
          <Show when={props.collapsible}>
            <span class="mise-toggle">
              {aberto() ? "Fechar ▲" : `Ver ${props.items.length} itens ▼`}
            </span>
          </Show>
        </button>
        <Show when={aberto()}>
          <div class="mise-list">
            <For each={props.items}>
              {(item) => (
                <div class="mise-item">
                  <span class="mise-qty">
                    {item.quantidade}{item.unidade}
                  </span>
                  <span class="mise-desc">{item.descricao}</span>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </Show>
  );
};

export default MiseEnPlaceList;
