import { Component, For } from "solid-js";
import type { Categoria } from "../types";

interface Props {
  active: Categoria | "todas";
  onChange: (cat: Categoria | "todas") => void;
}

const CATEGORIAS: { key: Categoria | "todas"; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "proteinas", label: "Proteínas" },
  { key: "carboidratos", label: "Carboidratos" },
  { key: "saladas-e-verduras", label: "Saladas" },
];

const CategoryFilter: Component<Props> = (props) => {
  return (
    <div class="category-filter">
      <For each={CATEGORIAS}>
        {(cat) => (
          <button
            class={`filter-btn ${props.active === cat.key ? "active" : ""}`}
            onClick={() => props.onChange(cat.key)}
          >
            {cat.label}
          </button>
        )}
      </For>
    </div>
  );
};

export default CategoryFilter;
