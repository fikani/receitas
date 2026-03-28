import type { Receita } from "../types";

export interface MiseEnPlaceItem {
  descricao: string;
  quantidade: number;
  unidade: "g" | "kg";
}

function extrairTipoPreparo(titulo: string): string {
  const t = titulo.toLowerCase();
  if (t.includes("brunoise")) return "brunoise (cubos de 3mm)";
  if (t.includes("meia-lua") || t.includes("meias-lua")) return "meias-luas";
  if (t.includes("tira")) return "em tiras";
  if (t.includes("fatiar") || t.includes("fati")) return "fatiado";
  if (t.includes("descascar") || t.includes("cortar")) return "descascado e cortado";
  if (t.includes("picar")) return "picado";
  if (t.includes("temperar")) return "temperar";
  if (t.includes("lavar")) return "lavado";
  if (t.includes("pesar") || t.includes("separar")) return "pesado e separado";
  if (t.includes("pré-aquecer") || t.includes("forno")) return "pré-aquecer";
  if (t.includes("manteiga")) return "em cubos gelados";
  if (t.includes("ricota")) return "temperada";
  if (t.includes("alho") && t.includes("cebola")) return "picado";
  if (t.includes("gelo") || t.includes("banho")) return "banho de gelo";
  if (t.includes("ferver")) return "fervendo";
  if (t.includes("preparar")) return "preparado";
  return "preparado";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function buildMiseEnPlaceSummary(
  receitas: Receita[],
  multiplicadores: Record<string, number>,
): MiseEnPlaceItem[] {
  const items: MiseEnPlaceItem[] = [];

  for (const receita of receitas) {
    const mult = multiplicadores[receita.id] ?? 1;
    const misePassos = receita.passos.filter((p) =>
      p.titulo.toLowerCase().startsWith("mise en place"),
    );

    for (const passo of misePassos) {
      const prepTipo = extrairTipoPreparo(passo.titulo);
      if (prepTipo === "pré-aquecer" || prepTipo === "banho de gelo" || prepTipo === "fervendo") continue;

      for (const ing of receita.ingredientes) {
        const nomeLC = ing.nome.toLowerCase();
        const tituloLC = passo.titulo.toLowerCase();
        const dicasTexto = passo.dicas.map((d) => d.texto.toLowerCase()).join(" ");

        const palavrasIng = nomeLC.split(/[\s()]+/).filter((w) => w.length > 3);
        const mencionado = palavrasIng.some(
          (p) => tituloLC.includes(p) || dicasTexto.includes(p),
        );

        if (mencionado) {
          const qtdEmG = ing.unidade === "kg" ? ing.quantidade * 1000 : ing.quantidade;
          const qtdTotal = qtdEmG * mult;

          items.push({
            descricao: `${ing.nome} — ${prepTipo}`,
            quantidade: qtdTotal,
            unidade: "g",
          });
        }
      }
    }
  }

  // Merge duplicates and convert units
  const merged = new Map<string, MiseEnPlaceItem>();
  for (const item of items) {
    const existing = merged.get(item.descricao);
    if (existing) {
      existing.quantidade += item.quantidade;
    } else {
      merged.set(item.descricao, { ...item });
    }
  }

  const result = Array.from(merged.values());
  for (const item of result) {
    if (item.quantidade >= 1000) {
      item.quantidade = Math.round((item.quantidade / 1000) * 10) / 10;
      item.unidade = "kg";
    } else {
      item.quantidade = Math.round(item.quantidade);
    }
  }

  return result;
}
