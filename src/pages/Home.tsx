import { Component, createSignal, For, Show, createMemo } from "solid-js";
import { A } from "@solidjs/router";
import type { Categoria } from "../types";
import { receitas, buscarReceitas } from "../store/recipes";
import { plano } from "../store/plan";
import CategoryFilter from "../components/CategoryFilter";
import SearchBar from "../components/SearchBar";
import RecipeCard from "../components/RecipeCard";
import ResumeBanner from "../components/ResumeBanner";

const Home: Component = () => {
  const [busca, setBusca] = createSignal("");
  const [categoria, setCategoria] = createSignal<Categoria | "todas">("todas");

  const listaFiltrada = createMemo(() => {
    let lista = busca() ? buscarReceitas(busca()) : (receitas() ?? []);
    if (categoria() !== "todas") {
      lista = lista.filter((r) => r.categoria === categoria());
    }
    return lista;
  });

  const temPlano = () =>
    plano.ativo && plano.ativo.etapa !== "concluido";

  return (
    <div class="page">
      <h1 style={{ "margin-bottom": "16px" }}>🍽️ Receitas</h1>

      <Show when={temPlano()}>
        <ResumeBanner etapa={plano.ativo!.etapa} />
      </Show>

      <SearchBar value={busca()} onInput={setBusca} />
      <CategoryFilter active={categoria()} onChange={setCategoria} />

      <div class="recipe-grid" style={{ "margin-top": "16px" }}>
        <For each={listaFiltrada()} fallback={<p class="empty">Nenhuma receita encontrada</p>}>
          {(receita) => <RecipeCard receita={receita} />}
        </For>
      </div>

      <A href="/plan" class="fab">+</A>
    </div>
  );
};

export default Home;
