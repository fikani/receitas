import { createSignal, createResource } from "solid-js";
import type { Receita, Categoria } from "../types";

async function fetchReceitas(): Promise<Receita[]> {
  const categorias = ["proteinas", "carboidratos", "saladas-e-verduras"];
  const results = await Promise.all(
    categorias.map(async (cat) => {
      const res = await fetch(`${import.meta.env.BASE_URL}data/${cat}.json`);
      return res.json() as Promise<Receita[]>;
    }),
  );
  return results.flat();
}

const [receitas] = createResource(fetchReceitas, { initialValue: [] });

export { receitas };

export function receitasPorCategoria(categoria: Categoria): Receita[] {
  return receitas()?.filter((r) => r.categoria === categoria) ?? [];
}

export function receitaPorId(id: string): Receita | undefined {
  return receitas()?.find((r) => r.id === id);
}

export function buscarReceitas(termo: string): Receita[] {
  const t = termo.toLowerCase().trim();
  if (!t) return receitas() ?? [];
  return (receitas() ?? []).filter((r) => r.nome.toLowerCase().includes(t));
}
