import { Component, For, Show, createMemo } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { plano, toggleCompraItem, avancarParaPreparo } from "../store/plan";
import { receitaPorId } from "../store/recipes";
import { consolidarIngredientes, type ItemCompras } from "../lib/calc";
import ShoppingItem from "../components/ShoppingItem";

const TIPO_LABEL: Record<string, string> = {
  carnes: "🥩 Carnes",
  vegetais: "🥬 Vegetais",
  temperos: "🧂 Temperos",
  laticinios: "🧀 Laticínios",
  graos: "🌾 Grãos",
  outros: "📦 Outros",
};

const Shopping: Component = () => {
  const navigate = useNavigate();

  const items = createMemo(() => {
    if (!plano.ativo) return [];
    const receitasList = plano.ativo.receitas
      .map((id) => receitaPorId(id))
      .filter(Boolean) as any[];
    return consolidarIngredientes(receitasList, plano.ativo.multiplicadores);
  });

  const porTipo = createMemo(() => {
    const grupos = new Map<string, ItemCompras[]>();
    for (const item of items()) {
      const list = grupos.get(item.tipo) ?? [];
      list.push(item);
      grupos.set(item.tipo, list);
    }
    return Array.from(grupos.entries());
  });

  const todosChecked = createMemo(() =>
    items().length > 0 && items().every((i) => plano.ativo?.comprasChecked.includes(i.key)),
  );

  const handleAvancar = () => {
    avancarParaPreparo();
    navigate("/cooking");
  };

  return (
    <div class="page">
      <h1 style={{ "margin-bottom": "8px" }}>🛒 Lista de Compras</h1>
      <p style={{ color: "var(--text-muted)", "margin-bottom": "16px" }}>
        {items().length} itens · Toque para marcar
      </p>

      <Show when={!plano.ativo}>
        <p class="empty">Nenhum plano ativo</p>
      </Show>

      <For each={porTipo()}>
        {([tipo, itens]) => (
          <>
            <p class="shopping-group-title">{TIPO_LABEL[tipo] ?? tipo}</p>
            <For each={itens}>
              {(item) => (
                <ShoppingItem
                  item={item}
                  checked={plano.ativo?.comprasChecked.includes(item.key) ?? false}
                  onToggle={toggleCompraItem}
                />
              )}
            </For>
          </>
        )}
      </For>

      <Show when={todosChecked()}>
        <button class="btn-primary btn-full" onClick={handleAvancar}>
          Começar preparo →
        </button>
      </Show>
    </div>
  );
};

export default Shopping;
