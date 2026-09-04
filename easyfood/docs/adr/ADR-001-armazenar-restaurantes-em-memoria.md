# ADR-001 - Armazenar restaurantes em memoria

## Status

Aceita

## Data

20/08/2026

## Responsavel

Equipe EasyFood

## Contexto

Estamos desenvolvendo a primeira versao da API da EasyFood.

Neste momento, a aplicacao precisa permitir:

- consultar restaurantes;
- cadastrar novos restaurantes.

O produto ainda esta em fase de prototipacao, teste e validacao. A prioridade desta primeira versao e validar o fluxo da aplicacao de forma rapida e simples antes de aumentar a complexidade da arquitetura.

## Alternativas consideradas

1. Array em memoria
2. PostgreSQL
3. MongoDB
4. SQLite
5. Firebase
6. Arquivo JSON

## Decisao

Adotar um array em memoria como mecanismo de armazenamento dos restaurantes na versao inicial do servico.

## Justificativa

- Permite maior velocidade no desenvolvimento.
- Facilita os primeiros testes da API.
- Possui baixa complexidade.
- Nao exige configuracao de infraestrutura.
- Nao possui custo adicional para esta fase do projeto.

## Consequencias

### Positivas

- Desenvolvimento mais rapido.
- Facilidade para testar GET e POST.
- Menor complexidade inicial.
- Permite validar o conceito da aplicacao rapidamente.

### Negativas

- Os dados sao perdidos quando o servidor reinicia.
- Nao existe persistencia dos dados.
- Nao e adequado para multiplas instancias da aplicacao.
- Possui limitacoes para consultas e analises mais complexas.
- Nao oferece os mesmos mecanismos de integridade disponiveis em um banco de dados.

## Criterios de revisao

Esta decisao devera ser reavaliada quando:

1. O MVP for validado e houver decisao de avancar para producao.
2. Houver necessidade de manter os dados entre reinicializacoes e deploys.
3. O volume de dados ultrapassar o que e razoavel manter em memoria.
4. For necessario realizar consultas mais complexas.
5. Surgirem relacionamentos entre diferentes entidades da aplicacao.

## Notas

Esta e uma decisao temporaria para a fase inicial da EasyFood. Antes da entrada em producao, devera ser avaliado um mecanismo adequado de persistencia.

A escolha desse mecanismo devera gerar uma nova decisao arquitetural: ADR-002 - Escolha do mecanismo de persistencia da EasyFood.
