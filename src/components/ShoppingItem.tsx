import type { Component } from "solid-js";
import type { ItemCompras } from "../lib/calc";

interface Props {
  item: ItemCompras;
  checked: boolean;
  onToggle: (key: string) => void;
}

const ShoppingItem: Component<Props> = (props) => {
  const quantidade = () => {
    const q = props.item.quantidade;
    return q % 1 === 0 ? q.toString() : q.toFixed(1);
  };

  return (
    <div
      class={`shopping-item ${props.checked ? "checked" : ""}`}
      onClick={() => props.onToggle(props.item.key)}
    >
      <div class="shopping-check">{props.checked ? "✅" : "⬜"}</div>
      <span class="shopping-nome">{props.item.nome}</span>
      <span class="shopping-qty">
        {quantidade()} {props.item.unidade}
      </span>
    </div>
  );
};

export default ShoppingItem;
