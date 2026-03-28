import { Component, Show, onMount, onCleanup } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { plano, proximoPasso, passoAnterior, concluirReceita } from "../store/plan";
import { receitaPorId } from "../store/recipes";
import StepView from "../components/StepView";
import ProgressBar from "../components/ProgressBar";

const CookingStep: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  let wakeLock: WakeLockSentinel | null = null;

  const receita = () => receitaPorId(params.id);
  const passoAtual = () => plano.ativo?.cozinhando?.passoAtual ?? 0;
  const totalPassos = () => receita()?.passos.length ?? 0;
  const passo = () => receita()?.passos[passoAtual()];
  const multiplicador = () => plano.ativo?.multiplicadores[params.id] ?? 1;
  const isUltimo = () => passoAtual() >= totalPassos() - 1;

  const handleProximo = () => {
    if (isUltimo()) {
      concluirReceita(params.id);
      releaseWakeLock();
      navigate("/cooking");
    } else {
      proximoPasso();
    }
  };

  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        wakeLock = await navigator.wakeLock.request("screen");
      }
    } catch {
      // Wake Lock not available
    }
  }

  function releaseWakeLock() {
    wakeLock?.release();
    wakeLock = null;
  }

  onMount(() => requestWakeLock());
  onCleanup(() => releaseWakeLock());

  return (
    <div class="page">
      <Show when={receita() && passo()} fallback={<p class="empty">Receita não encontrada</p>}>
        <ProgressBar current={passoAtual()} total={totalPassos()} />
        <StepView passo={passo()!} multiplicador={multiplicador()} />

        <div class="cooking-nav">
          <button
            class="cooking-nav-btn"
            onClick={passoAnterior}
            disabled={passoAtual() === 0}
          >
            ← Voltar
          </button>
          <button class="cooking-nav-btn primary" onClick={handleProximo}>
            {isUltimo() ? "Concluir ✅" : "Próximo →"}
          </button>
        </div>
      </Show>
    </div>
  );
};

export default CookingStep;
