import type { Component } from "solid-js";

interface Props {
  value: string;
  onInput: (value: string) => void;
}

const SearchBar: Component<Props> = (props) => {
  return (
    <input
      class="search-bar"
      type="search"
      placeholder="Buscar receita..."
      value={props.value}
      onInput={(e) => props.onInput(e.currentTarget.value)}
    />
  );
};

export default SearchBar;
