# ADR-005 - Propriedade e autorização de restaurantes

## Status

Aceita e implementada

## Data

08/11/2026

## Contexto

A autenticação JWT identifica quem está usando a API, mas apenas verificar a existência de um token permitiria que qualquer usuário autenticado alterasse o cardápio de qualquer restaurante. A aplicação precisa definir quem pode gerenciar cada restaurante e aplicar essa regra no backend.

## Alternativas consideradas

1. Permitir alterações para qualquer usuário autenticado.
2. Enviar o id do proprietário no corpo das requisições.
3. Relacionar o restaurante ao usuário autenticado e verificar a propriedade em cada alteração.
4. Criar papéis administrativos e permissões mais detalhadas.

## Decisão

Cada `Restaurant` possui um `ownerId` obrigatório relacionado a `User`. O proprietário é sempre obtido do JWT no momento da criação; a API não aceita um id de proprietário escolhido pelo cliente.

As consultas de restaurantes e pratos continuam públicas. Criar, atualizar ou excluir pratos e alterar suas imagens exige autenticação e a correspondência entre o usuário do token e o `ownerId` do restaurante. Uma tentativa autenticada de outro usuário retorna `403 Forbidden`.

## Justificativa

- Impede alterações no cardápio de terceiros.
- Mantém a regra de autorização próxima ao domínio de restaurantes e pratos.
- Evita confiar em identificadores de usuário enviados pelo cliente.
- Usa a relação já suportada pelo PostgreSQL e pelo Prisma.
- Mantém espaço para uma futura função administrativa sem introduzi-la antes de ser necessária.

## Consequências positivas

- Cada restaurante possui responsabilidade claramente definida.
- Uploads e CRUD de pratos seguem a mesma política.
- A interface pode apresentar controles apenas ao proprietário.
- O backend continua sendo a autoridade final, mesmo que um cliente ignore a interface.

## Consequências negativas / trade-offs

- Restaurantes antigos precisam receber um proprietário durante a migração ou o banco precisa ser recriado.
- Toda nova operação de alteração do restaurante ou cardápio deve incluir a verificação de propriedade.
- Ainda não existe delegação, equipe de restaurante ou papel administrativo.

## Registro de atividades

Criação de restaurante e alterações de pratos geram registros em `Activity`. Esse registro é secundário: falhas na auditoria são registradas no console, mas não desfazem a operação principal já concluída.

## Critérios de revisão

Esta decisão deverá ser reavaliada quando:

1. Um restaurante precisar de vários gestores.
2. Forem criados papéis administrativos.
3. Houver necessidade de transferir a propriedade.
4. O registro de atividades precisar guardar relações estruturadas com usuário e recurso.
