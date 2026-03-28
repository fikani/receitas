import type { Component } from "solid-js";
import type { Dica } from "../types";

const TipCard: Component<{ dica: Dica }> = (props) => {
  return (
    <div class="tip-card">
      <span class="tip-icon">{props.dica.icone}</span>
      <div class="tip-content">
        <p class="tip-title">{props.dica.titulo}</p>
        <p class="tip-text">{props.dica.texto}</p>
      </div>
    </div>
  );
};

export default TipCard;
