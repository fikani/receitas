import { Component, Show, createMemo, onMount, onCleanup } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { plano, proximoPasso, passoAnterior, concluirReceita, sairDaReceita } from "../store/plan";
import { receitaPorId } from "../store/recipes";
import StepView from "../components/StepView";
import ProgressBar from "../components/ProgressBar";
import MiseEnPlaceList from "../components/MiseEnPlaceList";
import ActionButton from "../components/ActionButton";
import { buildMiseEnPlaceSummary } from "../lib/mise-en-place";
import type { Receita } from "../types";

const CookingStep: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  let wakeLock: WakeLockSentinel | null = null;

  const receita = () => receitaPorId(params.id);
  const passoAtual = () => plano.ativo?.cozinhando?.passoAtual ?? 0;
  const totalPassos = () => (receita()?.passos.length ?? 0) + 1;
  const isMiseEnPlace = () => passoAtual() === 0;
  const passoReceita = () => receita()?.passos[passoAtual() - 1];
  const multiplicador = () => plano.ativo?.multiplicadores[params.id] ?? 1;
  const isUltimo = () => passoAtual() >= totalPassos() - 1;

  const miseEnPlace = createMemo(() => {
    const r = receita();
    if (!r || !plano.ativo) return [];
    return buildMiseEnPlaceSummary([r], plano.ativo.multiplicadores);
  });

  const handleProximo = () => {
    if (isUltimo()) {
      concluirReceita(params.id);
      releaseWakeLock();
      navigate("/cooking");
    } else {
      proximoPasso();
    }
  };

  const handleVoltar = () => {
    if (isMiseEnPlace()) {
      sairDaReceita();
      releaseWakeLock();
      navigate("/cooking");
    } else {
      passoAnterior();
    }
  };

  const handleSair = () => {
    sairDaReceita();
    releaseWakeLock();
    navigate("/cooking");
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
      <Show when={receita()} fallback={<p class="empty">Receita não encontrada</p>}>
        <div class="cooking-step-header">
          <h2 class="cooking-step-recipe-name">{receita()!.nome}</h2>
          <ActionButton variant="ghost" onClick={handleSair}>
            Sair ✕
          </ActionButton>
        </div>

        <ProgressBar current={passoAtual()} total={totalPassos()} />

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
            {isMiseEnPlace() ? "← Receitas" : "← Voltar"}
          </ActionButton>
          <ActionButton variant="primary" onClick={handleProximo}>
            {isUltimo() ? "Concluir ✅" : isMiseEnPlace() ? "Começar →" : "Próximo →"}
          </ActionButton>
        </div>
      </Show>
    </div>
  );
};

export default CookingStep;
