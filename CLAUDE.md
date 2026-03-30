# Receitas — Regras do Projeto

## Filosofia das Receitas

Este é um app de meal prep escrito **SEMPRE para um junior** — alguém que nunca cozinhou na vida. Ensina técnicas de nível Cordon Bleu mas de forma que qualquer pessoa consiga seguir.

### Regra de ouro: NUNCA assuma conhecimento prévio

- O usuário não sabe o que é "selar", "deglaçar", "brunoise", "braisage", "mirepoix", "fond", "al dente", "réduction", "sauté" ou qualquer outro termo
- **Todo termo técnico DEVE ser explicado na primeira vez que aparece** — no campo `descricao` do passo ou no `texto` da dica
- Explique o QUE é, POR QUE é feito assim, e COMO saber que deu certo
- Use linguagem simples e direta. "Crie uma casca dourada que prende o suco dentro" em vez de "sele a proteína"
- Cada receita é autocontida — não referencie conhecimento de outras receitas

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

## Regra: Descongelamento obrigatório em cada receita

Toda receita que vai para o freezer DEVE ter um campo `descongelamento` com instruções de nível profissional sobre como descongelar corretamente. Cada alimento tem uma técnica específica — descongelar errado destrói a textura e pode ser perigoso (zona de perigo bacteriológico entre 4°C e 60°C).

### Como aplicar:

1. **Pesquise a técnica correta** para cada tipo de alimento ao criar a receita. Não generalize — carne moída descongela diferente de frango com molho, que descongela diferente de arroz
2. **Explique como um junior**: o que fazer, por que, e quanto tempo leva
3. **Sempre ofereça o método ideal** (geladeira, lento e seguro) e um **método rápido** quando possível
4. **Inclua dicas de reaquecimento** — como aquecer sem ressecar ou empapar

### Estrutura no JSON:

```json
"descongelamento": {
  "metodo_ideal": "Transferir do freezer para a geladeira na noite anterior. Leva 8-12 horas.",
  "metodo_rapido": "Banho-maria frio: pote fechado em tigela com água da torneira, trocar a água a cada 30 min. Leva 1-2 horas.",
  "reaquecimento": "Frigideira em fogo médio com um fio de azeite, ou micro-ondas com tampa por 2-3 minutos.",
  "aviso": "NUNCA descongele em temperatura ambiente — a superfície entra na zona de perigo (4-60°C) enquanto o centro ainda está congelado."
}
```

### O que pesquisar ao criar cada receita:

- Tempo ideal de descongelamento na geladeira para aquele alimento
- Se o alimento pode ir direto do freezer pro reaquecimento (ex: arroz pode)
- Melhor método de reaquecimento para preservar textura (frigideira? forno? micro-ondas?)
- Riscos específicos (ex: frango NUNCA deve ser recongelado após descongelar)

## Regra: Contaminação cruzada — alertas obrigatórios

Toda receita que manipula carne crua DEVE ter alertas de contaminação cruzada nos passos de mise en place. Um junior não sabe que a mesma tábua que cortou frango cru pode causar uma intoxicação grave se depois cortar salada nela.

### O que incluir:

1. **Separação de utensílios** — usar tábuas e facas diferentes para carne crua e vegetais (ou lavar com água quente e sabão entre usos)
2. **Ordem de preparação** — SEMPRE preparar vegetais ANTES de carnes cruas. Se a receita tem os dois, os passos de mise en place de vegetais vêm primeiro
3. **Lavagem de mãos** — lembrar de lavar as mãos com sabão depois de tocar carne crua, antes de tocar qualquer outro ingrediente
4. **Superfícies** — limpar bancada e tábua com água quente e sabão depois de manipular carne crua
5. **Armazenamento na geladeira** — carne crua sempre na prateleira de BAIXO (se vazar, não contamina outros alimentos)

### Como aplicar nas dicas:

Use o ícone `⚠️` com título claro. Exemplos:
- "Lave a tábua e a faca com água quente e sabão ANTES de cortar os vegetais"
- "Mãos lavadas! Você acabou de tocar carne crua — lave com sabão antes de continuar"
- "Use uma tábua separada para a carne. Se só tiver uma, prepare os vegetais PRIMEIRO"

### O que pesquisar ao criar cada receita:

- Quais ingredientes são crus e apresentam risco (frango é o pior, seguido de porco e carne bovina)
- Se a receita mistura carne crua e vegetais no mise en place, a ordem está correta?
- Onde colocar alertas de lavagem de mãos entre preparações

## Regra: Todas as quantidades em gramas/kg

Sem "colheres", "xícaras" ou "pitadas". Tudo pesado na balança.

## Regra: Reutilizar componentes — NUNCA criar botões/links ad-hoc

Use SEMPRE o componente `ActionButton` para qualquer botão ou link de ação. NUNCA crie `<button>` ou `<A>` com classes CSS soltas nas pages.

```tsx
import ActionButton from "../components/ActionButton";

// Botão principal (laranja)
<ActionButton variant="primary" onClick={...}>Texto</ActionButton>

// Botão secundário (cinza)
<ActionButton onClick={...}>Texto</ActionButton>

// Link discreto (ghost — texto sublinhado)
<ActionButton variant="ghost" href="/">Cancelar</ActionButton>

// Botão largo e sticky no fundo
<ActionButton variant="primary" full onClick={...}>Avançar →</ActionButton>

// Link que parece botão
<ActionButton variant="primary" href="/plan">Iniciar</ActionButton>
```

**Por quê:** `<button>` e `<A>` (link) têm bases CSS diferentes no browser. Sem o componente, cada página reinventa estilos inline e os botões ficam inconsistentes (ex: link sem border-radius). O `ActionButton` renderiza `<A>` quando recebe `href` e `<button>` quando recebe `onClick`, com a mesma aparência garantida.

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

### Tela Descongelamento
- `descongelamento.metodo_ideal` — método lento e seguro (geladeira)
- `descongelamento.metodo_rapido` — método alternativo mais rápido (quando houver)
- `descongelamento.reaquecimento` — como aquecer preservando textura
- `descongelamento.aviso` — alertas de segurança alimentar
