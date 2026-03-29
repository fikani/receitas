import { Component, For, Show, createMemo } from "solid-js";
import { receitas } from "../store/recipes";
import { plano } from "../store/plan";
import ResumeBanner from "../components/ResumeBanner";
import ActionButton from "../components/ActionButton";

const CATEGORIAS = [
  { key: "proteinas" as const, emoji: "🥩", label: "Proteínas" },
  { key: "carboidratos" as const, emoji: "🍚", label: "Carboidratos" },
  { key: "saladas-e-verduras" as const, emoji: "🥗", label: "Saladas e Verduras" },
];

const Home: Component = () => {
  const temPlano = () =>
    plano.ativo && plano.ativo.etapa !== "concluido";

  const contagemPorCategoria = createMemo(() => {
    const todas = receitas() ?? [];
    return CATEGORIAS.map((cat) => ({
      ...cat,
      count: todas.filter((r) => r.categoria === cat.key).length,
      receitas: todas.filter((r) => r.categoria === cat.key),
    }));
  });

  const totalReceitas = createMemo(() =>
    (receitas() ?? []).length,
  );

  return (
    <div class="page">
      <h1 style={{ "margin-bottom": "4px" }}>🍽️ Meal Prep Planner</h1>
      <p style={{ color: "var(--text-muted)", "margin-bottom": "20px" }}>
        Planeje, compre, cozinhe e armazene
      </p>

      <Show when={temPlano()}>
        <ResumeBanner etapa={plano.ativo!.etapa} cozinhandoId={plano.ativo!.cozinhando?.receitaId} />
      </Show>

      <div class="home-categories">
        <For each={contagemPorCategoria()}>
          {(cat) => (
            <div class="home-cat-card">
              <span class="home-cat-emoji">{cat.emoji}</span>
              <div class="home-cat-info">
                <h3>{cat.label}</h3>
                <p>{cat.count} {cat.count === 1 ? "receita" : "receitas"}</p>
              </div>
              <div class="home-cat-recipes">
                <For each={cat.receitas}>
                  {(r) => <span class="home-cat-recipe-name">{r.nome}</span>}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>

      <Show when={totalReceitas() > 0}>
        <ActionButton variant="primary" full href="/plan">
          Iniciar Meal Prep ({totalReceitas()} receitas disponíveis)
        </ActionButton>
      </Show>
    </div>
  );
};

export default Home;
