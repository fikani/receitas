import { Component } from "solid-js";
import { A } from "@solidjs/router";

interface Props {
  etapa: string;
  cozinhandoId?: string;
}

const ETAPA_LABEL: Record<string, { label: string; path: string }> = {
  compras: { label: "Lista de compras em andamento", path: "/shopping" },
  preparo: { label: "Preparo em andamento", path: "/cooking" },
  armazenamento: { label: "Hora de embalar", path: "/storage" },
};

const ResumeBanner: Component<Props> = (props) => {
  const info = () => ETAPA_LABEL[props.etapa];

  const path = () => {
    if (props.etapa === "preparo" && props.cozinhandoId) {
      return `/cooking/${props.cozinhandoId}`;
    }
    return info()?.path ?? "/cooking";
  };

  const label = () => {
    if (props.etapa === "preparo" && props.cozinhandoId) {
      return "Continuar receita em andamento";
    }
    return info()?.label ?? "Plano em andamento";
  };

  return (
    <A href={path()} class="resume-banner">
      <span>📋 {label()}</span>
      <span class="resume-arrow">→</span>
    </A>
  );
};

export default ResumeBanner;
