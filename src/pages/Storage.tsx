import { Component, For, Show, createMemo } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { plano, toggleArmazenamento, setPoteSize, concluirPlano } from "../store/plan";
import { receitaPorId } from "../store/recipes";
import { calcularPotes } from "../lib/calc";
import PotCalculator from "../components/PotCalculator";
import ActionButton from "../components/ActionButton";

const Storage: Component = () => {
  const navigate = useNavigate();

  const calculos = createMemo(() => {
    if (!plano.ativo) return [];
    return plano.ativo.receitas.map((id) => {
      const receita = receitaPorId(id);
      if (!receita) return null;

      const receitasNaCat = plano.ativo!.receitas.filter((rid) => {
        const r = receitaPorId(rid);
        return r?.categoria === receita.categoria;
      }).length;

      const poteSizeMl = plano.ativo!.poteSizes[id] ?? 0;

      return calcularPotes(
        receita,
        plano.ativo!.multiplicadores[id],
        plano.ativo!.pessoas,
        plano.ativo!.dias,
        receitasNaCat,
        poteSizeMl,
      );
    }).filter(Boolean) as any[];
  });

  const todosProntos = createMemo(() =>
    plano.ativo?.receitas.every((id) => plano.ativo?.armazenamentoChecked.includes(id)),
  );

  const handleConcluir = () => {
    concluirPlano();
    navigate("/done");
  };

  return (
    <div class="page">
      <h1 style={{ "margin-bottom": "8px" }}>📦 Armazenamento</h1>
      <p style={{ color: "var(--text-muted)", "margin-bottom": "16px" }}>
        Separe em potes por receita — NÃO misture no mesmo pote
      </p>

      <For each={calculos()}>
        {(calc) => {
          const receita = () => receitaPorId(calc.receitaId);
          return (
            <div>
              <PotCalculator
                calculo={calc}
                checked={plano.ativo?.armazenamentoChecked.includes(calc.receitaId) ?? false}
                onToggle={() => toggleArmazenamento(calc.receitaId)}
                onPoteChange={(size) => setPoteSize(calc.receitaId, size)}
              />
              <Show when={receita()?.armazenamento}>
                <div class="storage-instructions">
                  <span>{receita()!.armazenamento.tipo === "freezer" ? "❄️" : "🧊"}</span>
                  <span>{receita()!.armazenamento.instrucoes}</span>
                  <span class="storage-validade">
                    Validade: {receita()!.armazenamento.validade_dias} dias
                  </span>
                </div>
              </Show>
            </div>
          );
        }}
      </For>

      <Show when={todosProntos()}>
        <ActionButton variant="primary" full onClick={handleConcluir}>
          Plano concluído! 🎉
        </ActionButton>
      </Show>
    </div>
  );
};

export default Storage;
