import { Component, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { plano, iniciarCozinha } from "../store/plan";
import { receitaPorId } from "../store/recipes";

const CookingHub: Component = () => {
  const navigate = useNavigate();

  const handleIniciar = (receitaId: string) => {
    iniciarCozinha(receitaId);
    navigate(`/cooking/${receitaId}`);
  };

  const todasConcluidas = () =>
    plano.ativo?.receitas.every((id) => plano.ativo?.receitasConcluidas.includes(id));

  return (
    <div class="page">
      <h1 style={{ "margin-bottom": "8px" }}>👨‍🍳 Preparo</h1>
      <p style={{ color: "var(--text-muted)", "margin-bottom": "16px" }}>
        Escolha uma receita pra preparar
      </p>

      <For each={plano.ativo?.receitas ?? []}>
        {(id) => {
          const receita = () => receitaPorId(id);
          const concluida = () => plano.ativo?.receitasConcluidas.includes(id);

          return (
            <div
              class={`cooking-recipe-item ${concluida() ? "done" : ""}`}
              onClick={() => !concluida() && handleIniciar(id)}
            >
              <div class="cooking-recipe-info">
                <h3>{receita()?.nome ?? id}</h3>
                <p>⏱️ {receita()?.tempo_preparo_min}min · {receita()?.passos.length} passos</p>
              </div>
              <span class="cooking-recipe-status">
                {concluida() ? "✅" : "→"}
              </span>
            </div>
          );
        }}
      </For>

      <Show when={todasConcluidas()}>
        <button class="btn-primary btn-full" onClick={() => navigate("/storage")}>
          Embalar tudo →
        </button>
      </Show>
    </div>
  );
};

export default CookingHub;
