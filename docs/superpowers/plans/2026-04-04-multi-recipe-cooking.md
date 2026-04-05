# Multi-Recipe Cooking Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow selecting up to 3 recipes in CookingHub to cook together with a tab-based interface in CookingStep.

**Architecture:** Extend `cozinhando` state from single-recipe to multi-recipe array with per-recipe progress. CookingHub gets checkboxes for selection. CookingStep gets a tab bar when multiple recipes are active. Tab switching is store-driven (no route changes).

**Tech Stack:** SolidJS, solid-js/store, @solidjs/router, CSS

---

### Task 1: Update Types

**Files:**
- Modify: `src/types.ts:60-66`

- [ ] **Step 1: Update PlanoAtivo.cozinhando type**

Replace the `cozinhando` field in the `PlanoAtivo` interface:

```typescript
cozinhando?: {
  receitas: Array<{ receitaId: string; passoAtual: number; concluida: boolean }>;
  abaAtiva: number;
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build errors in plan.ts and CookingStep.tsx (they still reference old shape). This confirms the type change propagated.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "refactor: update cozinhando type to support multi-recipe"
```

---

### Task 2: Update Store Functions

**Files:**
- Modify: `src/store/plan.ts`

- [ ] **Step 1: Update iniciarCozinha to accept array**

Replace `iniciarCozinha`:

```typescript
export function iniciarCozinha(receitaIds: string[]) {
  if (!plano.ativo) return;
  setPlano("ativo", "cozinhando", {
    receitas: receitaIds.map((id) => ({ receitaId: id, passoAtual: 0, concluida: false })),
    abaAtiva: 0,
  });
  persistir();
}
```

- [ ] **Step 2: Update proximoPasso to use abaAtiva**

Replace `proximoPasso`:

```typescript
export function proximoPasso() {
  if (!plano.ativo?.cozinhando) return;
  const idx = plano.ativo.cozinhando.abaAtiva;
  setPlano("ativo", "cozinhando", "receitas", idx, "passoAtual", (p) => p + 1);
  persistir();
}
```

- [ ] **Step 3: Update passoAnterior to use abaAtiva**

Replace `passoAnterior`:

```typescript
export function passoAnterior() {
  if (!plano.ativo?.cozinhando) return;
  const idx = plano.ativo.cozinhando.abaAtiva;
  setPlano("ativo", "cozinhando", "receitas", idx, "passoAtual", (p) => Math.max(0, p - 1));
  persistir();
}
```

- [ ] **Step 4: Add mudarAba function**

Add after `passoAnterior`:

```typescript
export function mudarAba(index: number) {
  if (!plano.ativo?.cozinhando) return;
  setPlano("ativo", "cozinhando", "abaAtiva", index);
  persistir();
}
```

- [ ] **Step 5: Update concluirReceita for multi-recipe**

Replace `concluirReceita`:

```typescript
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
    // Switch to next non-concluded tab
    const nextIdx = plano.ativo.cozinhando.receitas.findIndex((r) => !r.concluida);
    setPlano("ativo", "cozinhando", "abaAtiva", nextIdx);
  } else {
    // All in group done — clear cozinhando
    setPlano("ativo", "cozinhando", undefined);
    // Check if ALL plan recipes are done
    if (concluidas.length === plano.ativo.receitas.length) {
      setPlano("ativo", "etapa", "armazenamento");
    }
  }
  persistir();
}
```

- [ ] **Step 6: Update sairDaReceita**

No change needed — it already sets `cozinhando` to `undefined`.

- [ ] **Step 7: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Still errors in CookingHub.tsx and CookingStep.tsx (they call `iniciarCozinha(string)` instead of `iniciarCozinha(string[])`).

- [ ] **Step 8: Commit**

```bash
git add src/store/plan.ts
git commit -m "refactor: update store functions for multi-recipe cooking"
```

---

### Task 3: Update CookingHub with Selection

**Files:**
- Modify: `src/pages/CookingHub.tsx`

- [ ] **Step 1: Add selection state and update handlers**

Replace the entire CookingHub component:

```tsx
import { Component, For, Show, createMemo, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { plano, iniciarCozinha, reiniciarReceita, abandonarPlano } from "../store/plan";
import { receitaPorId } from "../store/recipes";
import type { Receita } from "../types";
import { buildMiseEnPlaceSummary } from "../lib/mise-en-place";
import MiseEnPlaceList from "../components/MiseEnPlaceList";
import ActionButton from "../components/ActionButton";

const MAX_SELECAO = 3;

const CookingHub: Component = () => {
  const navigate = useNavigate();
  const [selecionadas, setSelecionadas] = createSignal<string[]>([]);

  const toggleSelecao = (id: string) => {
    setSelecionadas((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECAO) return prev;
      return [...prev, id];
    });
  };

  const handleCozinhar = () => {
    const ids = selecionadas();
    if (ids.length === 0) return;
    iniciarCozinha(ids);
    navigate(`/cooking/${ids[0]}`);
  };

  const handleIniciarUnica = (receitaId: string) => {
    iniciarCozinha([receitaId]);
    navigate(`/cooking/${receitaId}`);
  };

  const handleReiniciar = (e: Event, receitaId: string) => {
    e.stopPropagation();
    reiniciarReceita(receitaId);
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

  const temSelecao = () => selecionadas().length > 0;

  return (
    <div class="page">
      <h1 style={{ "margin-bottom": "8px" }}>👨‍🍳 Preparo</h1>
      <p style={{ color: "var(--text-muted)", "margin-bottom": "16px" }}>
        Comece preparando todos os ingredientes
      </p>

      <MiseEnPlaceList
        items={miseEnPlace()}
        title="🔪 Mise en Place — Todas as receitas"
        collapsible
      />

      <h2 style={{ margin: "20px 0 12px", "font-size": "1.1em" }}>Receitas do plano</h2>

      <Show when={temSelecao()}>
        <p style={{ color: "var(--text-muted)", "font-size": "0.85em", "margin-bottom": "12px" }}>
          {selecionadas().length} de {MAX_SELECAO} selecionadas
        </p>
      </Show>

      <For each={plano.ativo?.receitas ?? []}>
        {(id) => {
          const receita = () => receitaPorId(id);
          const concluida = () => plano.ativo?.receitasConcluidas.includes(id);
          const selecionada = () => selecionadas().includes(id);

          return (
            <div
              class={`cooking-recipe-item ${concluida() ? "done" : ""} ${selecionada() ? "selected" : ""}`}
              onClick={() => {
                if (concluida()) return;
                if (temSelecao()) {
                  toggleSelecao(id);
                } else {
                  handleIniciarUnica(id);
                }
              }}
              onPointerDown={(e) => {
                if (concluida()) return;
                // Long press to start selection mode
              }}
            >
              <Show when={!concluida()}>
                <div
                  class={`cooking-recipe-checkbox ${selecionada() ? "checked" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelecao(id);
                  }}
                >
                  {selecionada() ? "☑" : "☐"}
                </div>
              </Show>
              <div class="cooking-recipe-info">
                <h3>{receita()?.nome ?? id}</h3>
                <p>⏱️ {receita()?.tempo_preparo_min}min · {receita()?.passos.length} passos</p>
              </div>
              <div class="cooking-recipe-actions">
                <Show when={concluida()}>
                  <button
                    class="cooking-restart-btn"
                    onClick={(e) => handleReiniciar(e, id)}
                  >
                    🔄 Refazer
                  </button>
                </Show>
                <span class="cooking-recipe-status">
                  {concluida() ? "✅" : selecionada() ? "" : "→"}
                </span>
              </div>
            </div>
          );
        }}
      </For>

      <Show when={temSelecao()}>
        <ActionButton variant="primary" full onClick={handleCozinhar}>
          {selecionadas().length > 1
            ? `Cozinhar ${selecionadas().length} em conjunto →`
            : "Cozinhar →"}
        </ActionButton>
      </Show>

      <Show when={todasConcluidas()}>
        <ActionButton variant="primary" full onClick={() => navigate("/storage")}>
          Embalar tudo →
        </ActionButton>
      </Show>

      <ActionButton variant="ghost" onClick={() => { abandonarPlano(); navigate("/"); }}>
        Cancelar preparo e voltar ao início
      </ActionButton>
    </div>
  );
};

export default CookingHub;
```

- [ ] **Step 2: Verify build compiles CookingHub**

Run: `npm run build 2>&1 | tail -5`
Expected: Errors only in CookingStep.tsx now (still uses old cozinhando shape).

- [ ] **Step 3: Commit**

```bash
git add src/pages/CookingHub.tsx
git commit -m "feat: add multi-recipe selection to CookingHub"
```

---

### Task 4: Create CookingTabBar Component

**Files:**
- Create: `src/components/CookingTabBar.tsx`

- [ ] **Step 1: Create the tab bar component**

```tsx
import { Component, For } from "solid-js";
import { receitaPorId } from "../store/recipes";

interface TabInfo {
  receitaId: string;
  concluida: boolean;
}

interface Props {
  receitas: TabInfo[];
  abaAtiva: number;
  onMudarAba: (index: number) => void;
  onVoltar: () => void;
}

const CookingTabBar: Component<Props> = (props) => {
  return (
    <div class="cooking-tab-bar">
      <button class="cooking-tab-back" onClick={props.onVoltar}>
        ←
      </button>
      <div class="cooking-tabs">
        <For each={props.receitas}>
          {(tab, i) => {
            const nome = () => receitaPorId(tab.receitaId)?.nome ?? tab.receitaId;
            return (
              <button
                class={`cooking-tab ${i() === props.abaAtiva ? "active" : ""} ${tab.concluida ? "done" : ""}`}
                onClick={() => props.onMudarAba(i())}
              >
                <span class="cooking-tab-name">{nome()}</span>
                {tab.concluida && <span class="cooking-tab-check"> ✅</span>}
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
};

export default CookingTabBar;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CookingTabBar.tsx
git commit -m "feat: add CookingTabBar component"
```

---

### Task 5: Update CookingStep for Multi-Recipe

**Files:**
- Modify: `src/pages/CookingStep.tsx`

- [ ] **Step 1: Rewrite CookingStep to support tabs**

Replace the entire file:

```tsx
import { Component, Show, createMemo, onMount, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import {
  plano, proximoPasso, passoAnterior,
  concluirReceita, sairDaReceita, mudarAba,
} from "../store/plan";
import { receitaPorId } from "../store/recipes";
import StepView from "../components/StepView";
import ProgressBar from "../components/ProgressBar";
import MiseEnPlaceList from "../components/MiseEnPlaceList";
import ActionButton from "../components/ActionButton";
import CookingTabBar from "../components/CookingTabBar";
import { buildMiseEnPlaceSummary } from "../lib/mise-en-place";
import type { Receita } from "../types";

const CookingStep: Component = () => {
  const navigate = useNavigate();
  let wakeLock: WakeLockSentinel | null = null;

  const cozinhando = () => plano.ativo?.cozinhando;
  const isMulti = () => (cozinhando()?.receitas.length ?? 0) > 1;
  const abaAtiva = () => cozinhando()?.abaAtiva ?? 0;
  const receitaAtiva = () => cozinhando()?.receitas[abaAtiva()];
  const receitaId = () => receitaAtiva()?.receitaId ?? "";
  const receita = () => receitaPorId(receitaId());
  const passoAtual = () => receitaAtiva()?.passoAtual ?? 0;
  const totalPassos = () => (receita()?.passos.length ?? 0) + 1;
  const isMiseEnPlace = () => passoAtual() === 0;
  const passoReceita = () => receita()?.passos[passoAtual() - 1];
  const multiplicador = () => plano.ativo?.multiplicadores[receitaId()] ?? 1;
  const isUltimo = () => passoAtual() >= totalPassos() - 1;
  const isAbaConcluida = () => receitaAtiva()?.concluida ?? false;

  const miseEnPlace = createMemo(() => {
    const r = receita();
    if (!r || !plano.ativo) return [];
    return buildMiseEnPlaceSummary([r], plano.ativo.multiplicadores);
  });

  const handleProximo = () => {
    if (isAbaConcluida()) return;
    if (isUltimo()) {
      const id = receitaId();
      concluirReceita(id);
      // If cozinhando was cleared (all done), navigate away
      if (!plano.ativo?.cozinhando) {
        releaseWakeLock();
        // Check if all plan recipes done
        if (plano.ativo?.receitasConcluidas.length === plano.ativo?.receitas.length) {
          navigate("/storage");
        } else {
          navigate("/cooking");
        }
      }
      // Otherwise concluirReceita already switched abaAtiva
    } else {
      proximoPasso();
    }
  };

  const handleVoltar = () => {
    if (isMiseEnPlace()) {
      if (!isMulti()) {
        sairDaReceita();
        releaseWakeLock();
        navigate("/cooking");
      }
      // In multi-mode, back on mise en place does nothing (use tab bar to switch)
    } else {
      passoAnterior();
    }
  };

  const handleSair = () => {
    sairDaReceita();
    releaseWakeLock();
    navigate("/cooking");
  };

  const handleMudarAba = (index: number) => {
    mudarAba(index);
  };

  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        wakeLock = await navigator.wakeLock.request("screen");
      }
    } catch {}
  }

  function releaseWakeLock() {
    wakeLock?.release();
    wakeLock = null;
  }

  onMount(() => requestWakeLock());
  onCleanup(() => releaseWakeLock());

  return (
    <div class="page">
      <Show when={cozinhando()} fallback={<p class="empty">Nenhuma receita em preparo</p>}>
        <Show when={isMulti()}>
          <CookingTabBar
            receitas={cozinhando()!.receitas}
            abaAtiva={abaAtiva()}
            onMudarAba={handleMudarAba}
            onVoltar={handleSair}
          />
        </Show>

        <Show when={receita()} fallback={<p class="empty">Receita não encontrada</p>}>
          <Show when={!isMulti()}>
            <div class="cooking-step-header">
              <h2 class="cooking-step-recipe-name">{receita()!.nome}</h2>
              <ActionButton variant="ghost" onClick={handleSair}>
                Sair ✕
              </ActionButton>
            </div>
          </Show>

          <Show when={isMulti()}>
            <h2 class="cooking-step-recipe-name" style={{ "margin-bottom": "8px" }}>
              {receita()!.nome}
            </h2>
          </Show>

          <ProgressBar current={passoAtual()} total={totalPassos()} />

          <Show when={isAbaConcluida()}>
            <div class="cooking-done-banner">
              ✅ Receita concluída — navegue pelos passos para reler
            </div>
          </Show>

          <Show when={isMiseEnPlace()}>
            <div class="step-view">
              <MiseEnPlaceList
                items={miseEnPlace()}
                title="🔪 Mise en Place — Prepare tudo antes de cozinhar"
              />
              <Show when={miseEnPlace().length === 0}>
                <div class="mise-section">
                  <h2 class="mise-title">🔪 Pronto pra começar</h2>
                  <p style={{ color: "var(--text-muted)" }}>
                    Esta receita não tem preparação prévia. Vamos direto ao fogo!
                  </p>
                </div>
              </Show>
            </div>
          </Show>

          <Show when={!isMiseEnPlace() && passoReceita()}>
            <StepView passo={passoReceita()!} multiplicador={multiplicador()} />
          </Show>

          <div class="cooking-nav">
            <ActionButton onClick={handleVoltar}>
              {isMiseEnPlace() && !isMulti() ? "← Receitas" : "← Voltar"}
            </ActionButton>
            <Show when={!isAbaConcluida()}>
              <ActionButton variant="primary" onClick={handleProximo}>
                {isUltimo() ? "Concluir ✅" : isMiseEnPlace() ? "Começar →" : "Próximo →"}
              </ActionButton>
            </Show>
            <Show when={isAbaConcluida()}>
              <ActionButton onClick={() => proximoPasso()}>
                Próximo →
              </ActionButton>
            </Show>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default CookingStep;
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/CookingStep.tsx
git commit -m "feat: update CookingStep with tab support for multi-recipe"
```

---

### Task 6: Add CSS Styles

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add tab bar and selection styles**

Append to the end of `src/index.css`:

```css
/* CookingTabBar */
.cooking-tab-bar {
  display: flex;
  align-items: center;
  gap: 0;
  margin: -16px -16px 16px;
  padding: 0 8px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.cooking-tab-back {
  min-width: 44px;
  min-height: 44px;
  background: none;
  color: var(--text-muted);
  font-size: 1.3em;
  flex-shrink: 0;
  border-radius: 0;
}

.cooking-tabs {
  display: flex;
  flex: 1;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.cooking-tab {
  flex: 1;
  min-height: 44px;
  padding: 10px 12px;
  background: none;
  color: var(--text-muted);
  font-size: 0.85em;
  border-radius: 0;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}

.cooking-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: bold;
}

.cooking-tab.done {
  opacity: 0.6;
}

.cooking-tab.done.active {
  opacity: 1;
}

.cooking-tab-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
}

.cooking-tab-check {
  font-size: 0.8em;
}

/* Checkbox in CookingHub */
.cooking-recipe-checkbox {
  font-size: 1.4em;
  min-width: 32px;
  text-align: center;
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;
}

.cooking-recipe-checkbox.checked {
  color: var(--accent);
}

.cooking-recipe-item.selected {
  border-color: var(--accent);
}

/* Done banner in CookingStep */
.cooking-done-banner {
  background: var(--bg-surface);
  color: var(--success);
  text-align: center;
  padding: 10px 16px;
  border-radius: var(--radius);
  margin-bottom: 12px;
  font-size: 0.9em;
  font-weight: bold;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add styles for tab bar and multi-recipe selection"
```

---

### Task 7: Fix Timer Bug (Already Identified)

**Files:**
- Modify: `src/components/StepView.tsx`

Note: This fix was already applied earlier in the conversation. If already committed, skip this task. The fix adds `keyed` to the `<Show>` wrapping `TimerButton` so the timer resets when `timer_min` changes between steps.

- [ ] **Step 1: Verify the fix is in place**

Check `StepView.tsx` line 41 has `<Show when={props.passo.timer_min} keyed>`.

- [ ] **Step 2: Commit if not already committed**

```bash
git add src/components/StepView.tsx
git commit -m "fix: reset timer when navigating between cooking steps"
```

---

### Task 8: Manual Testing Checklist

- [ ] **Single recipe**: Select 1 recipe in CookingHub → should work exactly like before (no tab bar)
- [ ] **Multi recipe**: Check 2-3 recipes → "Cozinhar em conjunto" → tab bar appears with all recipes
- [ ] **Tab switching**: Click tabs to switch between recipes, each maintains its own step position
- [ ] **Complete one**: Finish all steps of one recipe → tab gets ✅, auto-switches to next
- [ ] **Re-read done tab**: Click ✅ tab → can browse steps read-only
- [ ] **← Voltar in tab bar**: Returns to /cooking with no selection
- [ ] **Complete last in group (more in plan)**: Finishes → goes to /cooking
- [ ] **Complete last in group (all plan done)**: Finishes → goes to /storage
- [ ] **Max 3**: Can't select more than 3 recipes
- [ ] **Completed recipes**: Can't select already-completed recipes
- [ ] **Timer**: Timer resets properly when switching steps within a tab
