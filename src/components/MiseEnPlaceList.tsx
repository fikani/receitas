import { Component, For, Show } from "solid-js";
import type { MiseEnPlaceItem } from "../lib/mise-en-place";

interface Props {
  items: MiseEnPlaceItem[];
  title: string;
}

const MiseEnPlaceList: Component<Props> = (props) => {
  return (
    <Show when={props.items.length > 0}>
      <div class="mise-section">
        <h2 class="mise-title">{props.title}</h2>
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
      </div>
    </Show>
  );
};

export default MiseEnPlaceList;
