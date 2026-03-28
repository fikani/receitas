import type { Receita, Ingrediente } from "../types";

export function calcularMultiplicador(
  receita: Receita,
  pessoas: number,
  dias: number,
  receitasNaCategoria: number,
): number {
  const porcoesTotais = (pessoas * dias) / receitasNaCategoria;
  return porcoesTotais / receita.porcoes_base;
}

export interface ItemCompras {
  nome: string;
  quantidade: number;
  unidade: "g" | "kg";
  tipo: Ingrediente["tipo"];
  key: string;
}

export function consolidarIngredientes(
  receitas: Receita[],
  multiplicadores: Record<string, number>,
): ItemCompras[] {
  const mapa = new Map<string, ItemCompras>();

  for (const receita of receitas) {
    const mult = multiplicadores[receita.id] ?? 1;
    for (const ing of receita.ingredientes) {
      const key = `${ing.nome.toLowerCase()}|${ing.tipo}`;
      const quantidadeEmG =
        ing.unidade === "kg" ? ing.quantidade * 1000 : ing.quantidade;
      const existing = mapa.get(key);
      if (existing) {
        existing.quantidade += quantidadeEmG * mult;
      } else {
        mapa.set(key, {
          nome: ing.nome,
          quantidade: quantidadeEmG * mult,
          unidade: "g",
          tipo: ing.tipo,
          key,
        });
      }
    }
  }

  const items = Array.from(mapa.values());

  for (const item of items) {
    if (item.quantidade >= 1000) {
      item.quantidade = item.quantidade / 1000;
      item.unidade = "kg";
    } else {
      item.quantidade = Math.round(item.quantidade);
    }
  }

  return items.sort((a, b) => a.tipo.localeCompare(b.tipo));
}

export interface CalculoPotes {
  receitaId: string;
  receitaNome: string;
  quantidadeTotal: number;
  poteSizeMl: number;
  numeroPotes: number;
  porcoesPorPote: number;
}

export function calcularPotes(
  receita: Receita,
  multiplicador: number,
  pessoas: number,
  dias: number,
  receitasNaCategoria: number,
  poteSizeMl: number,
): CalculoPotes {
  const porcoesTotais = (pessoas * dias) / receitasNaCategoria;
  const pesoBasePorPorcao =
    receita.ingredientes.reduce((sum, i) => {
      const g = i.unidade === "kg" ? i.quantidade * 1000 : i.quantidade;
      return sum + g;
    }, 0) / receita.porcoes_base;

  const quantidadeTotal = pesoBasePorPorcao * porcoesTotais;

  if (poteSizeMl === 0) {
    return {
      receitaId: receita.id,
      receitaNome: receita.nome,
      quantidadeTotal,
      poteSizeMl: 0,
      numeroPotes: Math.ceil(porcoesTotais),
      porcoesPorPote: 1,
    };
  }

  const porcoesPorPote = Math.floor(poteSizeMl / pesoBasePorPorcao) || 1;
  const numeroPotes = Math.ceil(porcoesTotais / porcoesPorPote);

  return {
    receitaId: receita.id,
    receitaNome: receita.nome,
    quantidadeTotal,
    poteSizeMl,
    numeroPotes,
    porcoesPorPote,
  };
}
