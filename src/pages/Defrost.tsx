import { Component, createSignal, For, Show, createMemo } from "solid-js";
import { receitas } from "../store/recipes";
import RecipeCard from "../components/RecipeCard";
import ActionButton from "../components/ActionButton";
import type { Receita } from "../types";

const CATEGORIAS = [
  { key: "proteinas" as const, emoji: "🥩", label: "Proteínas" },
  { key: "carboidratos" as const, emoji: "🍚", label: "Carboidratos" },
  { key: "saladas-e-verduras" as const, emoji: "🥗", label: "Saladas e Verduras" },
];

const Defrost: Component = () => {
  const [selecionadas, setSelecionadas] = createSignal<string[]>([]);
  const [mostrarInstrucoes, setMostrarInstrucoes] = createSignal(false);

  const toggleReceita = (id: string) => {
    setSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const receitasSelecionadas = createMemo(() =>
    (receitas() ?? []).filter((r) => selecionadas().includes(r.id)),
  );

  const receitasPorCategoria = (cat: string) =>
    (receitas() ?? []).filter((r) => r.categoria === cat);

  return (
    <div class="page">
      {/* Selection screen */}
      <Show when={!mostrarInstrucoes()}>
        <h1 style={{ "margin-bottom": "4px" }}>❄️ Descongelar Refeição</h1>
        <p style={{ color: "var(--text-muted)", "margin-bottom": "20px" }}>
          Escolha o que vai comer — o app mostra como descongelar e reaquecer cada item
        </p>

        <For each={CATEGORIAS}>
          {(cat) => (
            <Show when={receitasPorCategoria(cat.key).length > 0}>
              <h2 style={{ margin: "16px 0 8px", "font-size": "1em" }}>
                {cat.emoji} {cat.label}
              </h2>
              <div class="recipe-grid">
                <For each={receitasPorCategoria(cat.key)}>
                  {(receita) => (
                    <RecipeCard
                      receita={receita}
                      selected={selecionadas().includes(receita.id)}
                      onSelect={toggleReceita}
                    />
                  )}
                </For>
              </div>
            </Show>
          )}
        </For>

        <Show when={selecionadas().length > 0}>
          <ActionButton
            variant="primary"
            full
            onClick={() => setMostrarInstrucoes(true)}
          >
            Ver instruções ({selecionadas().length} {selecionadas().length === 1 ? "receita" : "receitas"})
          </ActionButton>
        </Show>

        <ActionButton variant="ghost" href="/">
          ← Voltar ao início
        </ActionButton>
      </Show>

      {/* Instructions screen */}
      <Show when={mostrarInstrucoes()}>
        <h1 style={{ "margin-bottom": "4px" }}>❄️ Descongelar</h1>
        <p style={{ color: "var(--text-muted)", "margin-bottom": "20px" }}>
          Siga os passos para cada receita
        </p>

        <For each={receitasSelecionadas()}>
          {(receita) => <DefrostCard receita={receita} />}
        </For>

        <ActionButton variant="ghost" onClick={() => setMostrarInstrucoes(false)}>
          ← Voltar à seleção
        </ActionButton>
      </Show>
    </div>
  );
};

const DefrostCard: Component<{ receita: Receita }> = (props) => {
  const d = () => props.receita.descongelamento;
  const a = () => props.receita.armazenamento;

  return (
    <div class="defrost-card">
      <h3 class="defrost-card-title">{props.receita.nome}</h3>

      <Show when={!d()}>
        <p style={{ color: "var(--text-muted)" }}>
          Sem instruções de descongelamento disponíveis.
        </p>
      </Show>

      <Show when={d()}>
        <div class="defrost-step">
          <span class="defrost-step-icon">🧊</span>
          <div>
            <p class="defrost-step-label">
              {a()?.tipo === "freezer" ? "Descongelamento ideal" : "Armazenamento"}
            </p>
            <p class="defrost-step-text">{d()!.metodo_ideal}</p>
          </div>
        </div>

        <Show when={d()!.metodo_rapido}>
          <div class="defrost-step">
            <span class="defrost-step-icon">⚡</span>
            <div>
              <p class="defrost-step-label">Método rápido</p>
              <p class="defrost-step-text">{d()!.metodo_rapido}</p>
            </div>
          </div>
        </Show>

        <div class="defrost-step">
          <span class="defrost-step-icon">🔥</span>
          <div>
            <p class="defrost-step-label">Reaquecimento</p>
            <p class="defrost-step-text">{d()!.reaquecimento}</p>
          </div>
        </div>

        <Show when={d()!.aviso}>
          <div class="defrost-step defrost-warning">
            <span class="defrost-step-icon">⚠️</span>
            <div>
              <p class="defrost-step-label">Atenção</p>
              <p class="defrost-step-text">{d()!.aviso}</p>
            </div>
          </div>
        </Show>

        <Show when={a()}>
          <div class="defrost-validity">
            {a()!.tipo === "freezer" ? "❄️" : "🧊"} Validade: {a()!.validade_dias} dias
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default Defrost;
