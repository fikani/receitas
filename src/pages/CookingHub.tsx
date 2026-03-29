import { Component, For, Show, createMemo } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { plano, iniciarCozinha, reiniciarReceita, abandonarPlano } from "../store/plan";
import { receitaPorId } from "../store/recipes";
import type { Receita } from "../types";
import { buildMiseEnPlaceSummary } from "../lib/mise-en-place";
import MiseEnPlaceList from "../components/MiseEnPlaceList";
import ActionButton from "../components/ActionButton";

const CookingHub: Component = () => {
  const navigate = useNavigate();

  const handleIniciar = (receitaId: string) => {
    iniciarCozinha(receitaId);
    navigate(`/cooking/${receitaId}`);
  };

  const handleReiniciar = (e: Event, receitaId: string) => {
    e.stopPropagation();
    reiniciarReceita(receitaId);
  };

  const todasConcluidas = () =>
    plano.ativo?.receitas.every((id) => plano.ativo?.receitasConcluidas.includes(id));

  const miseEnPlace = createMemo(() => {
    if (!plano.ativo) return [];
    const receitasList = plano.ativo.receitas
      .map((id) => receitaPorId(id))
      .filter(Boolean) as Receita[];
    return buildMiseEnPlaceSummary(receitasList, plano.ativo.multiplicadores);
  });

  return (
    <div class="page">
      <h1 style={{ "margin-bottom": "8px" }}>👨‍🍳 Preparo</h1>
      <p style={{ color: "var(--text-muted)", "margin-bottom": "16px" }}>
        Comece preparando todos os ingredientes
      </p>

      <MiseEnPlaceList
        items={miseEnPlace()}
        title="🔪 Mise en Place — Todas as receitas"
        collapsible
      />

      <h2 style={{ margin: "20px 0 12px", "font-size": "1.1em" }}>Receitas do plano</h2>

      <For each={plano.ativo?.receitas ?? []}>
        {(id) => {
          const receita = () => receitaPorId(id);
          const concluida = () => plano.ativo?.receitasConcluidas.includes(id);

          return (
            <div
              class={`cooking-recipe-item ${concluida() ? "done" : ""}`}
              onClick={() => handleIniciar(id)}
            >
              <div class="cooking-recipe-info">
                <h3>{receita()?.nome ?? id}</h3>
                <p>⏱️ {receita()?.tempo_preparo_min}min · {receita()?.passos.length} passos</p>
              </div>
              <div class="cooking-recipe-actions">
                <Show when={concluida()}>
                  <button
                    class="cooking-restart-btn"
                    onClick={(e) => handleReiniciar(e, id)}
                  >
                    🔄 Refazer
                  </button>
                </Show>
                <span class="cooking-recipe-status">
                  {concluida() ? "✅" : "→"}
                </span>
              </div>
            </div>
          );
        }}
      </For>

      <Show when={todasConcluidas()}>
        <ActionButton variant="primary" full onClick={() => navigate("/storage")}>
          Embalar tudo →
        </ActionButton>
      </Show>

      <ActionButton variant="ghost" onClick={() => { abandonarPlano(); navigate("/"); }}>
        Cancelar preparo e voltar ao início
      </ActionButton>
    </div>
  );
};

export default CookingHub;
