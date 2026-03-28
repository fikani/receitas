import type { PlanoAtivo } from "../types";

const KEYS = {
  plano: "mealprep:plano",
  preferencias: "mealprep:prefs",
} as const;

export function salvarPlano(plano: PlanoAtivo): void {
  localStorage.setItem(KEYS.plano, JSON.stringify(plano));
}

export function carregarPlano(): PlanoAtivo | null {
  const raw = localStorage.getItem(KEYS.plano);
  if (!raw) return null;
  return JSON.parse(raw) as PlanoAtivo;
}

export function limparPlano(): void {
  localStorage.removeItem(KEYS.plano);
}

export interface Preferencias {
  potePadraoMl: number;
}

const PREFS_DEFAULT: Preferencias = {
  potePadraoMl: 0,
};

export function carregarPreferencias(): Preferencias {
  const raw = localStorage.getItem(KEYS.preferencias);
  if (!raw) return PREFS_DEFAULT;
  return { ...PREFS_DEFAULT, ...JSON.parse(raw) };
}

export function salvarPreferencias(prefs: Preferencias): void {
  localStorage.setItem(KEYS.preferencias, JSON.stringify(prefs));
}
