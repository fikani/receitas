# Multi-Recipe Cooking Flow

## Problem

Currently, the cooking flow only supports one recipe at a time. The user must finish or exit a recipe before starting another. In real meal prep, you often cook 2-3 recipes in parallel (e.g., while the pressure cooker runs, you prep a salad). The app should support selecting up to 3 recipes to cook together, with tabs to switch between them.

## Design

### CookingHub (`/cooking`) — Selection Mode

- Each recipe card gains a **checkbox** for selection (max 3).
- When **0 selected**: no action button (current state, each card has its own "Iniciar" button).
- When **1 selected**: single recipe flow, no tabs (identical to current behavior). Button: "Cozinhar".
- When **2-3 selected**: multi-recipe flow with tabs. Button: "Cozinhar em conjunto".
- Already-completed recipes cannot be selected (keep current behavior — show as done with "Refazer" option).

### Store Changes (`plan.ts`)

The `cozinhando` field changes shape:

**Before:**
```typescript
cozinhando?: { receitaId: string; passoAtual: number }
```

**After:**
```typescript
cozinhando?: {
  receitas: Array<{ receitaId: string; passoAtual: number; concluida: boolean }>;
  abaAtiva: number; // index into receitas[]
}
```

**New/modified store functions:**
- `iniciarCozinha(receitaIds: string[])` — accepts array, creates `cozinhando` with all recipes at passoAtual=0, concluida=false, abaAtiva=0.
- `proximoPasso()` — increments `passoAtual` on the recipe at `abaAtiva` index.
- `passoAnterior()` — decrements `passoAtual` on the recipe at `abaAtiva` index.
- `mudarAba(index: number)` — sets `abaAtiva` to given index.
- `concluirReceita(receitaId)` — marks recipe as `concluida: true` in the cozinhando list, adds to `receitasConcluidas`, then:
  - If other non-concluded recipes exist in the group: auto-switch `abaAtiva` to next non-concluded.
  - If this was the last in the group: clear `cozinhando`, then check if all plan recipes are done → advance to armazenamento, else stay on `/cooking`.
- `sairDaReceita()` — clears `cozinhando` entirely (back to hub with nothing selected).

### CookingStep (`/cooking/:id`) — Tab Bar

**When multi-recipe** (cozinhando.receitas.length > 1):

A fixed tab bar at the top of the page:

```
[← Voltar]  [Frango Braisé]  [Bisteca Suína ✅]  [Carne Moída]
```

- **"← Voltar"** button on the left — navigates to `/cooking`, clears `cozinhando` (reset to hub).
- **Tabs** show recipe name (truncated if needed).
- **Active tab** has visual highlight (bold, underline, or colored border).
- **Concluded tab** shows ✅ suffix, dimmed style, but still clickable to re-read steps.
- Clicking a tab calls `mudarAba(index)` and the step content updates.

**When single-recipe** (cozinhando.receitas.length === 1):
- No tab bar. Identical to current behavior.

### Route Changes

The current route `/cooking/:id` uses the recipe ID in the URL. With multi-recipe, the route changes to:

- `/cooking/session` — the multi-recipe cooking view (reads active recipes from store).
- `/cooking/:id` — kept for single-recipe backward compatibility.

Alternative (simpler): keep `/cooking/:id` using the **first** recipe ID. The tab switching happens via store state (`abaAtiva`), not URL changes. This avoids route changes entirely.

**Recommended: keep `/cooking/:id`** with the first recipe's ID. Tab switching is store-driven. Simpler, no new routes needed.

### Step Navigation Within Tabs

Each tab maintains its own `passoAtual` independently:
- "Proximo" / "Anterior" buttons affect only the active tab's recipe.
- Progress bar shows progress for the active tab's recipe.
- Timer state is per-tab (already handled since TimerButton will remount per step).

### Completion Flow

When user clicks "Concluir" on the last step of a recipe:

1. Mark recipe as `concluida: true` in cozinhando, add to `receitasConcluidas`.
2. If other tabs are not concluded → auto-switch to next non-concluded tab.
3. If this was the **last tab**:
   - Check if ALL plan recipes are done (including ones not in this session).
   - If yes → advance to armazenamento etapa, navigate to `/storage`.
   - If no → clear `cozinhando`, navigate to `/cooking` (hub shows remaining recipes).

### Edge Cases

- **User clicks concluded tab**: can browse all steps read-only. No "Concluir" button (already done). "Proximo"/"Anterior" still work for navigation.
- **User clicks "← Voltar"**: clears `cozinhando`, goes to `/cooking`. Progress within the session is lost (passoAtual resets). Completed recipes stay completed.
- **App reload during session**: `cozinhando` is persisted to localStorage, so session resumes where left off.
- **3 recipes selected but one is already done**: shouldn't happen — completed recipes have checkboxes disabled.

## Files to Modify

1. **`src/types.ts`** — update `PlanoAtivo.cozinhando` type
2. **`src/store/plan.ts`** — update `iniciarCozinha`, `proximoPasso`, `passoAnterior`, `concluirReceita`, `sairDaReceita`; add `mudarAba`
3. **`src/pages/CookingHub.tsx`** — add checkboxes, selection state, "Cozinhar em conjunto" button
4. **`src/pages/CookingStep.tsx`** — add tab bar component, read `abaAtiva` from store, render active recipe
5. **`src/components/CookingTabBar.tsx`** (new) — tab bar with back button, recipe tabs, active/concluded states
6. **`src/index.css`** — styles for tab bar, checkboxes, selection state

## Out of Scope

- Timer synchronization across tabs (each tab has independent timers)
- Reordering tabs
- Adding/removing recipes mid-session
- Parallel timer notifications (timer only alerts for active tab's step)
