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
    if (isAbaConcluida()) {
      // Allow browsing steps on concluded recipe
      if (!isUltimo()) proximoPasso();
      return;
    }
    if (isUltimo()) {
      const id = receitaId();
      concluirReceita(id);
      // If cozinhando was cleared (all done), navigate away
      if (!plano.ativo?.cozinhando) {
        releaseWakeLock();
        if (plano.ativo?.receitasConcluidas.length === plano.ativo?.receitas.length) {
          navigate("/storage");
        } else {
          navigate("/cooking");
        }
      }
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
            <ActionButton variant={isAbaConcluida() ? undefined : "primary"} onClick={handleProximo}>
              {isAbaConcluida()
                ? (isUltimo() ? "← Voltar" : "Próximo →")
                : isUltimo()
                  ? "Concluir ✅"
                  : isMiseEnPlace()
                    ? "Começar →"
                    : "Próximo →"}
            </ActionButton>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default CookingStep;
