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
