import type { Component } from "solid-js";
import type { Receita } from "../types";

interface Props {
  receita: Receita;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onClick?: (id: string) => void;
}

const CATEGORIA_LABEL: Record<string, string> = {
  proteinas: "🥩 Proteína",
  carboidratos: "🍚 Carboidrato",
  "saladas-e-verduras": "🥗 Salada",
};

const RecipeCard: Component<Props> = (props) => {
  const handleClick = () => {
    if (props.onSelect) props.onSelect(props.receita.id);
    if (props.onClick) props.onClick(props.receita.id);
  };

  return (
    <div
      class={`recipe-card ${props.selected ? "selected" : ""}`}
      onClick={handleClick}
    >
      <div class="recipe-card-header">
        <span class="recipe-categoria">
          {CATEGORIA_LABEL[props.receita.categoria] ?? props.receita.categoria}
        </span>
        <span class="recipe-tempo">⏱️ {props.receita.tempo_preparo_min}min</span>
      </div>
      <h3 class="recipe-nome">{props.receita.nome}</h3>
      <p class="recipe-porcoes">{props.receita.porcoes_base} porções</p>
    </div>
  );
};

export default RecipeCard;
