# ADR-002 - Persistencia com PostgreSQL

## Status

Aceita

## Data

03/09/2026

## Responsavel

Equipe EasyFood

## Contexto

A EasyFood deixou de ser apenas uma API com dados temporarios em memoria. O teste de reinicializacao mostrou que restaurantes cadastrados desapareciam quando o processo Node.js era encerrado.

Agora a aplicacao precisa manter os restaurantes entre reinicializacoes do servidor, preservando o comportamento externo das rotas:

- GET /restaurants
- POST /restaurants

## Alternativas consideradas

1. PostgreSQL
2. MongoDB
3. SQLite
4. Firebase
5. Arquivo JSON
6. Manter array em memoria

## Decisao

Adotar PostgreSQL como banco de dados relacional da EasyFood e utilizar Prisma como camada de acesso ao banco.

## Justificativa

- PostgreSQL oferece persistencia real para os dados da aplicacao.
- O modelo de restaurantes possui estrutura clara, adequada para tabelas relacionais.
- A EasyFood podera evoluir para novos relacionamentos, como cardapios, usuarios e pedidos.
- Prisma reduz a necessidade de escrever SQL diretamente no codigo da API.
- Migrations ajudam a registrar a evolucao do schema do banco.

## Consequencias positivas

- Restaurantes cadastrados continuam existindo apos reiniciar o servidor.
- A API fica mais proxima de um cenario real de producao.
- O banco oferece integridade e estrutura para os dados.
- Prisma centraliza o acesso ao banco e facilita consultas e insercoes.
- A arquitetura fica preparada para crescimento futuro.

## Consequencias negativas / trade-offs

- A aplicacao passa a depender de um banco disponivel.
- E necessario configurar DATABASE_URL.
- O ambiente de desenvolvimento fica mais complexo.
- Migrations precisam ser mantidas junto com o codigo.
- Erros de conexao com o banco precisam ser tratados pela API.

## Criterios de revisao

Esta decisao devera ser reavaliada quando:

1. O volume de dados crescer significativamente.
2. As consultas exigirem otimizacoes especificas.
3. Surgirem requisitos de alta disponibilidade.
4. O custo operacional do banco se tornar um problema.
5. A arquitetura da EasyFood exigir separacao de servicos ou novos modelos de persistencia.
