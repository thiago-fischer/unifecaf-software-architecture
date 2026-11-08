# ADR-003 - Autenticacao da EasyFood

## Status

Aceita e implementada na Atividade 5 (17/09/2026)

## Data

03/09/2026

## Responsavel

Equipe EasyFood

## Contexto

A EasyFood possui operacoes publicas de consulta e operacoes de alteracao que precisam identificar o usuario responsavel. O modulo `src/modules/auth` deve permitir cadastro, login e consulta da sessao sem expor senhas, alem de fornecer uma identidade confiavel para as regras de propriedade dos restaurantes.

## Alternativas consideradas

1. JWT
2. AWS Cognito
3. Login com Google
4. Outra solucao externa de identidade

## Decisao

Para o contexto atual da EasyFood, a solucao escolhida e autenticacao baseada em JWT. A Atividade 5 implementa cadastro e login, hash de senha com bcrypt, JWT com expiracao de um dia, identificacao em /auth/me e protecao do POST /restaurants. GET /restaurants permanece publico.

O JWT tambem identifica o proprietario nas operacoes de cardapio. Autenticacao e autorizacao sao tratadas separadamente: possuir um token valido permite criar um restaurante, mas somente o usuario cujo id corresponde ao `ownerId` pode alterar os pratos daquele restaurante.

## Justificativa

- JWT e uma alternativa comum em APIs Node.js.
- Permite manter a EasyFood simples durante a fase de aprendizado e prototipacao.
- Pode ser organizada dentro do modulo auth seguindo o mesmo padrao de routes, controller e service.
- Evita introduzir uma dependencia externa grande antes de existir uma necessidade real de producao.

## Consequencias positivas

- Mantem a arquitetura simples.
- Facilita o entendimento do fluxo de autenticacao.
- Combina bem com APIs REST.
- Permite aplicar autorizacao por recurso sem aceitar ids de usuario enviados pelo cliente.
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
