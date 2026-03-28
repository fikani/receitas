import { Component } from "solid-js";
import { A } from "@solidjs/router";

interface Props {
  etapa: string;
}

const ETAPA_LABEL: Record<string, { label: string; path: string }> = {
  compras: { label: "Lista de compras em andamento", path: "/shopping" },
  preparo: { label: "Preparo em andamento", path: "/cooking" },
  armazenamento: { label: "Hora de embalar", path: "/storage" },
};

const ResumeBanner: Component<Props> = (props) => {
  const info = () => ETAPA_LABEL[props.etapa];

  return (
    <A href={info()?.path ?? "/cooking"} class="resume-banner">
      <span>📋 {info()?.label ?? "Plano em andamento"}</span>
      <span class="resume-arrow">→</span>
    </A>
  );
};

export default ResumeBanner;
