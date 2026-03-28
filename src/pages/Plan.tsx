import { Component, createSignal, For, Show, createMemo } from "solid-js";
import { useNavigate } from "@solidjs/router";
import type { Categoria } from "../types";
import { receitas } from "../store/recipes";
import { criarPlano } from "../store/plan";
import RecipeCard from "../components/RecipeCard";
import NumericInput from "../components/NumericInput";
import CategoryFilter from "../components/CategoryFilter";

const Plan: Component = () => {
  const navigate = useNavigate();
  const [selecionadas, setSelecionadas] = createSignal<string[]>([]);
  const [pessoas, setPessoas] = createSignal(2);
  const [dias, setDias] = createSignal(7);
  const [categoria, setCategoria] = createSignal<Categoria | "todas">("todas");

  const toggleReceita = (id: string) => {
    setSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const listaFiltrada = createMemo(() => {
    const todas = receitas() ?? [];
    if (categoria() !== "todas") {
      return todas.filter((r) => r.categoria === categoria());
    }
    return todas;
  });

  const totalPorcoes = createMemo(() => pessoas() * dias());

  const podeCriar = () => selecionadas().length > 0;

  const handleCriar = () => {
    criarPlano(selecionadas(), pessoas(), dias());
    navigate("/shopping");
  };

  return (
    <div class="page">
      <h1 style={{ "margin-bottom": "8px" }}>📋 Novo Plano</h1>
      <p style={{ color: "var(--text-muted)", "margin-bottom": "16px" }}>
        Selecione as receitas e configure seu meal prep
      </p>

      <NumericInput label="Pessoas" value={pessoas()} min={1} max={20} onChange={setPessoas} />
      <NumericInput label="Dias" value={dias()} min={1} max={30} onChange={setDias} />

      <Show when={selecionadas().length > 0}>
        <div class="plan-summary">
          <p>{selecionadas().length} receita(s) · {totalPorcoes()} refeições</p>
        </div>
      </Show>

      <h2 style={{ margin: "16px 0 12px" }}>Escolha as receitas</h2>
      <CategoryFilter active={categoria()} onChange={setCategoria} />

      <div class="recipe-grid" style={{ "margin-top": "12px" }}>
        <For each={listaFiltrada()}>
          {(receita) => (
            <RecipeCard
              receita={receita}
              selected={selecionadas().includes(receita.id)}
              onSelect={toggleReceita}
            />
          )}
        </For>
      </div>

      <Show when={podeCriar()}>
        <button class="btn-primary btn-full" onClick={handleCriar}>
          Ir pra lista de compras →
        </button>
      </Show>
    </div>
  );
};

export default Plan;
