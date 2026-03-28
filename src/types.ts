export interface Ingrediente {
  nome: string;
  quantidade: number;
  unidade: "g" | "kg";
  tipo: "carnes" | "vegetais" | "temperos" | "laticinios" | "graos" | "outros";
}

export interface Dica {
  icone: string;
  titulo: string;
  texto: string;
}

export interface Passo {
  titulo: string;
  descricao: string;
  metodo?: "🍳" | "🫕" | "🥘" | "🍟" | "🔥" | "♨️";
  fogo?: "baixo" | "medio" | "alto";
  temperatura_c?: number;
  timer_min?: number;
  dicas: Dica[];
}

export interface Armazenamento {
  tipo: "geladeira" | "freezer";
  validade_dias: number;
  instrucoes: string;
}

export interface Receita {
  id: string;
  nome: string;
  categoria: "proteinas" | "carboidratos" | "saladas-e-verduras";
  tempo_preparo_min: number;
  porcoes_base: number;
  ingredientes: Ingrediente[];
  passos: Passo[];
  armazenamento: Armazenamento;
}

export type Categoria = Receita["categoria"];

export interface PlanoAtivo {
  id: string;
  receitas: string[];
  pessoas: number;
  dias: number;
  multiplicadores: Record<string, number>;
  etapa: "compras" | "preparo" | "armazenamento" | "concluido";
  comprasChecked: string[];
  receitasConcluidas: string[];
  cozinhando?: {
    receitaId: string;
    passoAtual: number;
  };
  armazenamentoChecked: string[];
  poteSizes: Record<string, number>;
}
