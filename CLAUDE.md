# Receitas — Regras do Projeto

## Filosofia das Receitas

Este é um app de meal prep para iniciantes que ensina técnicas de nível Cordon Bleu de forma acessível. O público não sabe cozinhar — cada receita deve ser autocontida e não assumir conhecimento prévio.

## Regra: Mise en Place obrigatório

Toda receita DEVE começar com passos de **Mise en Place** (preparação dos ingredientes) ANTES de qualquer passo de cozimento. Um iniciante não sabe o que é "brunoise de cebola" — ele precisa aprender a cortar a cebola primeiro.

### Como aplicar:

1. **Cada ingrediente que precisa de preparação ganha seu passo** (ou agrupa preparações similares no mesmo passo)
2. **Explique o que é a técnica** no campo `descricao` — ex: "Brunoise é o corte francês em cubos de 3mm. Quanto menor o cubo, mais rápido cozinha e mais sabor libera"
3. **Mostre como fazer** nas dicas — ex: como segurar a faca, como cortar a cebola pela metade primeiro
4. **Nunca use jargão sem explicar** — se disser "brunoise", explique o que é. Se disser "julienne", mostre o tamanho
5. **Preparações que podem ser feitas juntas** (ex: picar cebola e alho) podem ficar no mesmo passo
6. **Secar carne, temperar, trazer à temperatura ambiente** — tudo isso é mise en place e deve ser um passo explícito

### Exemplo de passo de Mise en Place:

```json
{
  "titulo": "Cortar a cebola em brunoise",
  "descricao": "Brunoise é o nome francês para cubos minúsculos de 3mm. Parece difícil mas tem um truque: corte a cebola ao meio, faça cortes horizontais e verticais sem separar, e depois fatie. Os cubos se formam sozinhos",
  "dicas": [
    {
      "icone": "🔪",
      "titulo": "Corte ao meio pelo eixo raiz-topo",
      "texto": "Não tire a raiz! Ela segura as camadas juntas enquanto você corta."
    }
  ]
}
```

## Regra: Todas as quantidades em gramas/kg

Sem "colheres", "xícaras" ou "pitadas". Tudo pesado na balança.

## Regra: Ícones como linguagem visual

Cada passo usa ícones que com o tempo o usuário reconhece sem ler. Ver spec para lista completa.

## Propriedades que o app extrai das receitas

O app lê os JSONs de receitas e extrai dados automaticamente para preencher as telas. Ao criar/editar receitas, garanta que estas propriedades estejam corretas:

### Tela Home — Catálogo
- `nome` — nome exibido no card
- `categoria` — agrupa nas seções (proteinas, carboidratos, saladas-e-verduras)
- `tempo_preparo_min` — exibido no card
- `porcoes_base` — exibido no card e usado pra calcular multiplicadores

### Tela Plano — Cálculos
- `porcoes_base` — divisor para calcular multiplicador: `(pessoas × dias) / receitasNaCategoria / porcoes_base`
- `categoria` — agrupa receitas da mesma categoria para dividir porções igualmente entre elas
- `ingredientes[].quantidade` e `ingredientes[].unidade` — base para multiplicar

### Tela Compras — Lista consolidada
- `ingredientes[].nome` — ingredientes com mesmo nome (case insensitive) são somados
- `ingredientes[].quantidade` — multiplicado pelo multiplicador do plano
- `ingredientes[].unidade` — convertido pra kg se >= 1000g
- `ingredientes[].tipo` — agrupa na lista (carnes, vegetais, temperos, laticinios, graos, outros)

### Tela Preparo Hub — Resumo Mise en Place
O app identifica passos de mise en place pelo título começando com "Mise en Place".
Para cada passo, cruza o texto das `dicas` com os `ingredientes` da receita para extrair:
- **Nome do ingrediente** — pelo match de palavras do `ingredientes[].nome` no texto das dicas
- **Tipo de preparo** — extraído do `titulo` do passo:
  - "brunoise" → "brunoise (cubos de 3mm)"
  - "meia-lua" → "meias-luas"
  - "tira" → "em tiras"
  - "descascar"/"cortar" → "descascado e cortado"
  - "picar" → "picado"
  - "lavar" → "lavado"
  - etc.
- **Quantidade** — `ingredientes[].quantidade × multiplicador`

**IMPORTANTE**: Para o match funcionar, o texto das dicas DEVE mencionar o ingrediente com palavras que existam no campo `ingredientes[].nome`. Ex: se o ingrediente é "Cebola", a dica deve conter "cebola".

### Tela Preparo — Passo a passo
- `passos[].titulo` — título grande do passo
- `passos[].descricao` — explicação do porquê da técnica
- `passos[].metodo` — emoji do método (🍳🫕🥘🍟🔥♨️), exibido grande ao lado do título
- `passos[].fogo` — "baixo"/"medio"/"alto", exibido como badge de intensidade
- `passos[].temperatura_c` — exibido como badge "🌡️ 220°C"
- `passos[].timer_min` — gera botão de timer com contagem regressiva
- `passos[].dicas[]` — cards visuais com:
  - `icone` — emoji grande à esquerda
  - `titulo` — texto bold
  - `texto` — explicação detalhada

### Tela Armazenamento — Potes
- `armazenamento.tipo` — "geladeira" ou "freezer", exibido com ícone
- `armazenamento.validade_dias` — exibido em destaque
- `armazenamento.instrucoes` — texto de instrução
- Cálculo de potes usa `ingredientes` total para estimar peso por porção
