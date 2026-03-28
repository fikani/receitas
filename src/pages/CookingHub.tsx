import { Component, For, Show, createMemo } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { plano, iniciarCozinha } from "../store/plan";
import { receitaPorId } from "../store/recipes";
import type { Receita, Ingrediente } from "../types";

interface MiseEnPlaceItem {
  descricao: string;
  quantidade: number;
  unidade: "g" | "kg";
}

function extrairMiseEnPlace(
  receitas: Receita[],
  multiplicadores: Record<string, number>,
): MiseEnPlaceItem[] {
  const mapa = new Map<string, MiseEnPlaceItem>();

  for (const receita of receitas) {
    const mult = multiplicadores[receita.id] ?? 1;
    const misePassos = receita.passos.filter((p) =>
      p.titulo.toLowerCase().startsWith("mise en place"),
    );

    for (const passo of misePassos) {
      // Extract ingredient references from tips
      for (const dica of passo.dicas) {
        // Match patterns like "cebola (150g)", "alho (20g)", "750g de batata-doce"
        const matches = dica.texto.matchAll(
          /(?:(\d+)g\s+de\s+)?([A-Za-zÀ-ú\s-]+?)\s*\((\d+)g\)/g,
        );
        for (const match of matches) {
          const qtdStr = match[3] || match[1];
          const nome = match[2].trim().toLowerCase();
          if (!qtdStr || !nome) continue;

          const qtdBase = parseInt(qtdStr);
          // Build a key from the mise en place step title + ingredient
          const prepTipo = extrairTipoPreparo(passo.titulo);
          const key = `${nome}|${prepTipo}`;
          const qtdTotal = qtdBase * mult;

          const existing = mapa.get(key);
          if (existing) {
            existing.quantidade += qtdTotal;
          } else {
            mapa.set(key, {
              descricao: `${capitalize(nome)} — ${prepTipo}`,
              quantidade: qtdTotal,
              unidade: "g",
            });
          }
        }

        // Also match "os Xg de ingrediente" or "Xg de ingrediente"
        const matches2 = dica.texto.matchAll(
          /(?:os\s+)?(\d+)g\s+de\s+([A-Za-zÀ-ú\s-]+?)(?:\.|,|\s+e\s|\s+que|\s+em|\s+ao|\s+com|\s+na|\s+num)/g,
        );
        for (const match of matches2) {
          const qtdBase = parseInt(match[1]);
          let nome = match[2].trim().toLowerCase();
          // Skip water and generic
          if (nome.includes("água") || nome.includes("gelo")) continue;
          if (qtdBase < 1) continue;

          const prepTipo = extrairTipoPreparo(passo.titulo);
          const key = `${nome}|${prepTipo}`;
          const qtdTotal = qtdBase * mult;

          if (!mapa.has(key)) {
            mapa.set(key, {
              descricao: `${capitalize(nome)} — ${prepTipo}`,
              quantidade: qtdTotal,
              unidade: "g",
            });
          }
        }
      }
    }
  }

  // Convert to kg if needed
  const items = Array.from(mapa.values());
  for (const item of items) {
    if (item.quantidade >= 1000) {
      item.quantidade = Math.round((item.quantidade / 1000) * 10) / 10;
      item.unidade = "kg";
    } else {
      item.quantidade = Math.round(item.quantidade);
    }
  }

  return items;
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

/** Build a simpler list directly from recipe ingredients + mise en place steps */
function buildMiseEnPlaceSummary(
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
      // Skip non-ingredient steps
      if (prepTipo === "pré-aquecer" || prepTipo === "banho de gelo" || prepTipo === "fervendo") continue;

      // Find ingredient references in the step title
      for (const ing of receita.ingredientes) {
        const nomeLC = ing.nome.toLowerCase();
        const tituloLC = passo.titulo.toLowerCase();
        const dicasTexto = passo.dicas.map((d) => d.texto.toLowerCase()).join(" ");

        // Check if this ingredient is mentioned in the step title or tips
        const palavrasIng = nomeLC.split(/[\s()]+/).filter((w) => w.length > 3);
        const mencionado = palavrasIng.some(
          (p) => tituloLC.includes(p) || dicasTexto.includes(p),
        );

        if (mencionado) {
          const qtdEmG = ing.unidade === "kg" ? ing.quantidade * 1000 : ing.quantidade;
          const qtdTotal = qtdEmG * mult;

          items.push({
            descricao: `${ing.nome} — ${prepTipo}`,
            quantidade: qtdTotal >= 1000
              ? Math.round((qtdTotal / 1000) * 10) / 10
              : Math.round(qtdTotal),
            unidade: qtdTotal >= 1000 ? "kg" : "g",
          });
        }
      }
    }
  }

  // Merge duplicates
  const merged = new Map<string, MiseEnPlaceItem>();
  for (const item of items) {
    const existing = merged.get(item.descricao);
    if (existing) {
      // Convert both to grams, sum, then decide unit
      const existG = existing.unidade === "kg" ? existing.quantidade * 1000 : existing.quantidade;
      const newG = item.unidade === "kg" ? item.quantidade * 1000 : item.quantidade;
      const totalG = existG + newG;
      existing.quantidade = totalG >= 1000
        ? Math.round((totalG / 1000) * 10) / 10
        : Math.round(totalG);
      existing.unidade = totalG >= 1000 ? "kg" : "g";
    } else {
      merged.set(item.descricao, { ...item });
    }
  }

  return Array.from(merged.values());
}

const CookingHub: Component = () => {
  const navigate = useNavigate();

  const handleIniciar = (receitaId: string) => {
    iniciarCozinha(receitaId);
    navigate(`/cooking/${receitaId}`);
  };

  const todasConcluidas = () =>
    plano.ativo?.receitas.every((id) => plano.ativo?.receitasConcluidas.includes(id));

  const miseEnPlace = createMemo(() => {
    if (!plano.ativo) return [];
    const receitasList = plano.ativo.receitas
      .map((id) => receitaPorId(id))
      .filter(Boolean) as Receita[];
    return buildMiseEnPlaceSummary(receitasList, plano.ativo.multiplicadores);
  });

  return (
    <div class="page">
      <h1 style={{ "margin-bottom": "8px" }}>👨‍🍳 Preparo</h1>
      <p style={{ color: "var(--text-muted)", "margin-bottom": "16px" }}>
        Comece preparando todos os ingredientes
      </p>

      {/* Mise en Place summary */}
      <Show when={miseEnPlace().length > 0}>
        <div class="mise-section">
          <h2 class="mise-title">🔪 Mise en Place — Preparar antes de cozinhar</h2>
          <div class="mise-list">
            <For each={miseEnPlace()}>
              {(item) => (
                <div class="mise-item">
                  <span class="mise-qty">
                    {item.quantidade}{item.unidade}
                  </span>
                  <span class="mise-desc">{item.descricao}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>

      <h2 style={{ margin: "20px 0 12px", "font-size": "1.1em" }}>Receitas do plano</h2>

      <For each={plano.ativo?.receitas ?? []}>
        {(id) => {
          const receita = () => receitaPorId(id);
          const concluida = () => plano.ativo?.receitasConcluidas.includes(id);

          return (
            <div
              class={`cooking-recipe-item ${concluida() ? "done" : ""}`}
              onClick={() => !concluida() && handleIniciar(id)}
            >
              <div class="cooking-recipe-info">
                <h3>{receita()?.nome ?? id}</h3>
                <p>⏱️ {receita()?.tempo_preparo_min}min · {receita()?.passos.length} passos</p>
              </div>
              <span class="cooking-recipe-status">
                {concluida() ? "✅" : "→"}
              </span>
            </div>
          );
        }}
      </For>

      <Show when={todasConcluidas()}>
        <button class="btn-primary btn-full" onClick={() => navigate("/storage")}>
          Embalar tudo →
        </button>
      </Show>
    </div>
  );
};

export default CookingHub;
