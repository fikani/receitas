import { Component, JSX, Show } from "solid-js";
import { A } from "@solidjs/router";

interface Props {
  /** "primary" = laranja, "secondary" = cinza card, "ghost" = texto discreto */
  variant?: "primary" | "secondary" | "ghost";
  /** true = width 100%, sticky no bottom */
  full?: boolean;
  /** Se tiver href, renderiza como link (<A>). Senão, como <button> */
  href?: string;
  onClick?: (e: Event) => void;
  disabled?: boolean;
  children: JSX.Element;
}

const ActionButton: Component<Props> = (props) => {
  const cls = () => {
    const parts = ["action-btn"];
    parts.push(`action-btn--${props.variant ?? "secondary"}`);
    if (props.full) parts.push("action-btn--full");
    if (props.disabled) parts.push("action-btn--disabled");
    return parts.join(" ");
  };

  return (
    <Show
      when={props.href}
      fallback={
        <button
          class={cls()}
          onClick={props.onClick}
          disabled={props.disabled}
        >
          {props.children}
        </button>
      }
    >
      <A
        href={props.href!}
        class={cls()}
        onClick={props.onClick}
      >
        {props.children}
      </A>
    </Show>
  );
};

export default ActionButton;
