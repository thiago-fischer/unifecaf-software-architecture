# ADR-003 - Planejamento de autenticacao da EasyFood

## Status

Proposta

## Data

03/09/2026

## Responsavel

Equipe EasyFood

## Contexto

A EasyFood foi organizada em camadas e esta preparada para receber novos modulos. Um novo dominio possivel e autenticacao, representado pela pasta src/modules/auth.

O objetivo neste momento e pesquisar e justificar como a autenticacao poderia se encaixar na arquitetura criada, sem tornar obrigatoria a implementacao completa do login.

## Alternativas consideradas

1. JWT
2. AWS Cognito
3. Login com Google
4. Outra solucao externa de identidade

## Decisao

Para o contexto atual da EasyFood, a solucao escolhida seria iniciar com autenticacao baseada em JWT.

## Justificativa

- JWT e uma alternativa comum em APIs Node.js.
- Permite manter a EasyFood simples durante a fase de aprendizado e prototipacao.
- Pode ser organizada dentro do modulo auth seguindo o mesmo padrao de routes, controller e service.
- Evita introduzir uma dependencia externa grande antes de existir uma necessidade real de producao.

## Consequencias positivas

- Mantem a arquitetura simples.
- Facilita o entendimento do fluxo de autenticacao.
- Combina bem com APIs REST.
- Pode evoluir futuramente para integracao com provedores externos.

## Consequencias negativas / trade-offs

- A equipe passa a ser responsavel por decisoes de seguranca, expiracao e validacao dos tokens.
- Pode nao ser suficiente para requisitos mais avancados, como login social, MFA e gestao centralizada de usuarios.
- Exige cuidado para proteger segredos e evitar tokens com tempo de vida inadequado.

## Criterios de revisao

Esta decisao devera ser reavaliada quando:

1. A EasyFood precisar de login social.
2. Houver necessidade de MFA.
3. A aplicacao caminhar para producao.
4. A gestao de usuarios se tornar mais complexa.
5. For necessario delegar autenticacao para um provedor especializado.
