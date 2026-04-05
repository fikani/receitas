import { createStore } from "solid-js/store";
import type { PlanoAtivo, Receita } from "../types";
import { salvarPlano, carregarPlano, limparPlano } from "../lib/persistence";
import { calcularMultiplicador } from "../lib/calc";
import { receitaPorId, receitas } from "./recipes";

const planoSalvo = carregarPlano();

const [plano, setPlano] = createStore<{ ativo: PlanoAtivo | null }>({
  ativo: planoSalvo,
});

function persistir() {
  if (plano.ativo) salvarPlano(plano.ativo);
}

export { plano };

export function criarPlano(receitaIds: string[], pessoas: number, dias: number) {
  const todasReceitas = receitas() ?? [];
  const multiplicadores: Record<string, number> = {};

  for (const id of receitaIds) {
    const receita = todasReceitas.find((r) => r.id === id);
    if (!receita) continue;
    const naCat = receitaIds.filter((rid) => {
      const r = todasReceitas.find((x) => x.id === rid);
      return r?.categoria === receita.categoria;
    }).length;
    multiplicadores[id] = calcularMultiplicador(receita, pessoas, dias, naCat);
  }

  setPlano("ativo", {
    id: Date.now().toString(36),
    receitas: receitaIds,
    pessoas,
    dias,
    multiplicadores,
    etapa: "compras",
    comprasChecked: [],
    receitasConcluidas: [],
    armazenamentoChecked: [],
    poteSizes: {},
  });
  persistir();
}

export function toggleCompraItem(key: string) {
  if (!plano.ativo) return;
  const checked = plano.ativo.comprasChecked;
  const next = checked.includes(key)
    ? checked.filter((k) => k !== key)
    : [...checked, key];
  setPlano("ativo", "comprasChecked", next);
  persistir();
}

export function avancarParaPreparo() {
  if (!plano.ativo) return;
  setPlano("ativo", "etapa", "preparo");
  persistir();
}

export function iniciarCozinha(receitaIds: string[]) {
  if (!plano.ativo) return;
  setPlano("ativo", "cozinhando", {
    receitas: receitaIds.map((id) => ({ receitaId: id, passoAtual: 0, concluida: false })),
    abaAtiva: 0,
  });
  persistir();
}

export function proximoPasso() {
  if (!plano.ativo?.cozinhando) return;
  const idx = plano.ativo.cozinhando.abaAtiva;
  setPlano("ativo", "cozinhando", "receitas", idx, "passoAtual", (p) => p + 1);
  persistir();
}

export function passoAnterior() {
  if (!plano.ativo?.cozinhando) return;
  const idx = plano.ativo.cozinhando.abaAtiva;
  setPlano("ativo", "cozinhando", "receitas", idx, "passoAtual", (p) => Math.max(0, p - 1));
  persistir();
}

export function mudarAba(index: number) {
  if (!plano.ativo?.cozinhando) return;
  setPlano("ativo", "cozinhando", "abaAtiva", index);
  persistir();
}

export function concluirReceita(receitaId: string) {
  if (!plano.ativo?.cozinhando) return;

  // Mark as concluida in cozinhando
  const receitaIdx = plano.ativo.cozinhando.receitas.findIndex((r) => r.receitaId === receitaId);
  if (receitaIdx >= 0) {
    setPlano("ativo", "cozinhando", "receitas", receitaIdx, "concluida", true);
  }

  // Add to global receitasConcluidas
  const concluidas = [...plano.ativo.receitasConcluidas, receitaId];
  setPlano("ativo", "receitasConcluidas", concluidas);

  // Find next non-concluded tab
  const remaining = plano.ativo.cozinhando.receitas.filter((r) => !r.concluida);
  if (remaining.length > 0) {
    const nextIdx = plano.ativo.cozinhando.receitas.findIndex((r) => !r.concluida);
    setPlano("ativo", "cozinhando", "abaAtiva", nextIdx);
  } else {
    // All in group done
    setPlano("ativo", "cozinhando", undefined);
    if (concluidas.length === plano.ativo.receitas.length) {
      setPlano("ativo", "etapa", "armazenamento");
    }
  }
  persistir();
}

export function sairDaReceita() {
  if (!plano.ativo) return;
  setPlano("ativo", "cozinhando", undefined);
  persistir();
}

export function reiniciarReceita(receitaId: string) {
  if (!plano.ativo) return;
  setPlano("ativo", {
    receitasConcluidas: plano.ativo.receitasConcluidas.filter((id) => id !== receitaId),
    cozinhando: undefined,
  });
  // If we were in storage, go back to preparo
  if (plano.ativo.etapa === "armazenamento") {
    setPlano("ativo", "etapa", "preparo");
  }
  persistir();
}

export function setPoteSize(receitaId: string, sizeMl: number) {
  if (!plano.ativo) return;
  setPlano("ativo", "poteSizes", receitaId, sizeMl);
  persistir();
}

export function toggleArmazenamento(receitaId: string) {
  if (!plano.ativo) return;
  const checked = plano.ativo.armazenamentoChecked;
  const next = checked.includes(receitaId)
    ? checked.filter((k) => k !== receitaId)
    : [...checked, receitaId];
  setPlano("ativo", "armazenamentoChecked", next);
  persistir();
}

export function concluirPlano() {
  setPlano("ativo", "etapa", "concluido");
  persistir();
}

export function abandonarPlano() {
  setPlano("ativo", null);
  limparPlano();
}
