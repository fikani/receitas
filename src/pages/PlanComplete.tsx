import { Component } from "solid-js";
import { A } from "@solidjs/router";
import { abandonarPlano } from "../store/plan";

const PlanComplete: Component = () => {
  const handleNovo = () => {
    abandonarPlano();
  };

  return (
    <div class="page" style={{ "text-align": "center", "padding-top": "20vh" }}>
      <p style={{ "font-size": "4em", "margin-bottom": "16px" }}>🎉</p>
      <h1 style={{ "margin-bottom": "8px" }}>Meal prep concluído!</h1>
      <p style={{ color: "var(--text-muted)", "margin-bottom": "32px" }}>
        Tudo preparado e embalado. Bom apetite!
      </p>
      <A href="/" class="btn-primary" onClick={handleNovo} style={{ display: "inline-block", padding: "16px 32px", "text-decoration": "none" }}>
        Voltar ao início
      </A>
    </div>
  );
};

export default PlanComplete;
