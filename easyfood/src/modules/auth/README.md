# Auth

Autenticação implementada na Atividade 5, seguindo a arquitetura de routes, controller e service.

## Executar

Na pasta `easyfood`, execute `npm install`. Configure `.env` usando `.env.example`, com a URL do PostgreSQL e uma chave JWT própria. Gere a chave com:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Copie o resultado para `JWT_SECRET` no `.env`, sem versionar esse arquivo. A aplicação exige essa configuração ao iniciar.

```sh
npx prisma migrate deploy
npx prisma generate
npm start
```

## Rotas

| Método | Rota | Autenticação | Resultado |
| --- | --- | --- | --- |
| POST | `/auth/register` | Pública | 201, usuário sem senha |
| POST | `/auth/login` | Pública | 200, `{ token, user }` |
| GET | `/auth/me` | Bearer JWT | 200, mensagem e usuário do token |
| GET | `/restaurants` | Pública | 200, lista de restaurantes |
| POST | `/restaurants` | Bearer JWT | 201, restaurante criado |

Cadastro: envie `{ "name": "Aluno", "email": "aluno@easyfood.com", "password": "123456" }` como JSON. Login: envie `email` e `password`. Nas rotas protegidas, use `Authorization: Bearer <token>`.

Senhas são armazenadas com bcrypt (custo 10). Tokens usam HS256 e expiram em um dia. Campos obrigatórios inválidos retornam 400, e-mail duplicado retorna 409 e credenciais ou tokens inválidos retornam 401. Nome e e-mail aceitam até 150 caracteres; senhas aceitam até 72 bytes UTF-8 para evitar truncamento pelo bcrypt.

`npm test` executa testes HTTP com bcrypt e JWT reais e persistência em memória, sem alterar o PostgreSQL.

A decisão arquitetural está registrada em `docs/adr/ADR-003-autenticacao-easyfood.md`.
