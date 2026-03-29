import { Component } from "solid-js";
import { abandonarPlano } from "../store/plan";
import ActionButton from "../components/ActionButton";

const PlanComplete: Component = () => {
  return (
    <div class="page" style={{ "text-align": "center", "padding-top": "20vh" }}>
      <p style={{ "font-size": "4em", "margin-bottom": "16px" }}>🎉</p>
      <h1 style={{ "margin-bottom": "8px" }}>Meal prep concluído!</h1>
      <p style={{ color: "var(--text-muted)", "margin-bottom": "32px" }}>
        Tudo preparado e embalado. Bom apetite!
      </p>
      <ActionButton variant="primary" href="/" onClick={abandonarPlano}>
        Voltar ao início
      </ActionButton>
    </div>
  );
};

export default PlanComplete;
