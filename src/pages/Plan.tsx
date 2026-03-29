import { Component, createSignal, For, Show, createMemo } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import type { Categoria } from "../types";
import { receitas } from "../store/recipes";
import { criarPlano } from "../store/plan";
import RecipeCard from "../components/RecipeCard";
import NumericInput from "../components/NumericInput";

const STEPS: { key: Categoria; emoji: string; label: string }[] = [
  { key: "proteinas", emoji: "🥩", label: "Proteínas" },
  { key: "carboidratos", emoji: "🍚", label: "Carboidratos" },
  { key: "saladas-e-verduras", emoji: "🥗", label: "Saladas e Verduras" },
];

const Plan: Component = () => {
  const navigate = useNavigate();
  const [etapa, setEtapa] = createSignal(0); // 0,1,2 = categories, 3 = config
  const [selecionadas, setSelecionadas] = createSignal<string[]>([]);
  const [pessoas, setPessoas] = createSignal(2);
  const [dias, setDias] = createSignal(7);

  const currentStep = () => STEPS[etapa()];
  const isConfig = () => etapa() === 3;

  const toggleReceita = (id: string) => {
    setSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const receitasDaEtapa = createMemo(() => {
    if (isConfig()) return [];
    const cat = currentStep()?.key;
    return (receitas() ?? []).filter((r) => r.categoria === cat);
  });

  const selecionadasDaEtapa = createMemo(() => {
    if (isConfig()) return [];
    const cat = currentStep()?.key;
    const ids = (receitas() ?? [])
      .filter((r) => r.categoria === cat)
      .map((r) => r.id);
    return selecionadas().filter((id) => ids.includes(id));
  });

  const selecionadasPorCategoria = (cat: Categoria) => {
    const ids = (receitas() ?? [])
      .filter((r) => r.categoria === cat)
      .map((r) => r.id);
    return selecionadas().filter((id) => ids.includes(id));
  };

  const receitaPorId = (id: string) =>
    (receitas() ?? []).find((r) => r.id === id);

  const avancar = () => {
    if (etapa() < 3) setEtapa(etapa() + 1);
  };

  const voltar = () => {
    if (etapa() > 0) setEtapa(etapa() - 1);
  };

  const handleCriar = () => {
    criarPlano(selecionadas(), pessoas(), dias());
    navigate("/shopping");
  };

  return (
    <div class="page">
      {/* Progress indicator */}
      <div class="plan-steps">
        <For each={STEPS}>
          {(step, i) => (
            <div
              class={`plan-step-dot ${i() === etapa() ? "active" : ""} ${i() < etapa() ? "done" : ""}`}
              onClick={() => setEtapa(i())}
            >
              <span class="plan-step-emoji">{step.emoji}</span>
              <span class="plan-step-count">
                {selecionadasPorCategoria(step.key).length}
              </span>
            </div>
          )}
        </For>
        <div
          class={`plan-step-dot ${isConfig() ? "active" : ""}`}
          onClick={() => selecionadas().length > 0 && setEtapa(3)}
        >
          <span class="plan-step-emoji">📋</span>
        </div>
      </div>

      {/* Category selection steps */}
      <Show when={!isConfig()}>
        <h1 style={{ "margin-bottom": "4px" }}>
          {currentStep().emoji} {currentStep().label}
        </h1>
        <p style={{ color: "var(--text-muted)", "margin-bottom": "16px" }}>
          Selecione as receitas de {currentStep().label.toLowerCase()}
        </p>

        <div class="recipe-grid">
          <For each={receitasDaEtapa()}>
            {(receita) => (
              <RecipeCard
                receita={receita}
                selected={selecionadas().includes(receita.id)}
                onSelect={toggleReceita}
              />
            )}
          </For>
        </div>

        <Show when={etapa() === 0}>
          <A href="/" class="btn-cancel">
            Cancelar e voltar ao início
          </A>
        </Show>

        <div class="plan-nav">
          <Show when={etapa() > 0}>
            <button class="cooking-nav-btn" onClick={voltar}>
              ← Voltar
            </button>
          </Show>
          <button class="cooking-nav-btn primary" onClick={avancar}>
            {etapa() < 2
              ? `Próximo: ${STEPS[etapa() + 1].emoji} ${STEPS[etapa() + 1].label} →`
              : selecionadas().length > 0
                ? "Montar plano →"
                : "Pular →"
            }
          </button>
        </div>
      </Show>

      {/* Configuration step */}
      <Show when={isConfig()}>
        <h1 style={{ "margin-bottom": "4px" }}>📋 Montar o Plano</h1>
        <p style={{ color: "var(--text-muted)", "margin-bottom": "16px" }}>
          Configure pra quantas pessoas e dias
        </p>

        <NumericInput label="Pessoas" value={pessoas()} min={1} max={20} onChange={setPessoas} />
        <NumericInput label="Dias" value={dias()} min={1} max={30} onChange={setDias} />

        <div class="plan-review">
          <h3 style={{ "margin-bottom": "12px" }}>Receitas selecionadas</h3>
          <For each={STEPS}>
            {(step) => {
              const items = () => selecionadasPorCategoria(step.key);
              return (
                <Show when={items().length > 0}>
                  <div class="plan-review-group">
                    <span class="plan-review-cat">{step.emoji} {step.label}</span>
                    <For each={items()}>
                      {(id) => (
                        <div class="plan-review-item">
                          <span>{receitaPorId(id)?.nome}</span>
                          <button
                            class="plan-review-remove"
                            onClick={() => toggleReceita(id)}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              );
            }}
          </For>
        </div>

        <div class="plan-total">
          {selecionadas().length} receita(s) · {pessoas() * dias()} refeições · {pessoas()} pessoa(s) · {dias()} dias
        </div>

        <div class="plan-nav">
          <button class="cooking-nav-btn" onClick={voltar}>
            ← Voltar
          </button>
          <Show when={selecionadas().length > 0}>
            <button class="cooking-nav-btn primary" onClick={handleCriar}>
              Ir pra lista de compras →
            </button>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default Plan;
