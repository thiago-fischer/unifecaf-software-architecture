# Arquitetura de Software — EasyFood

Repositório das atividades de Arquitetura de Software da UniFECAF. O projeto **EasyFood** permite consultar e cadastrar restaurantes, com cadastro de usuários e autenticação JWT.

O backend utiliza Node.js, Express, PostgreSQL e Prisma. O frontend utiliza HTML, CSS e JavaScript vanilla, com módulos nativos do navegador.

## Onde está o frontend?

**O frontend é servido pelo próprio Express, no mesmo servidor e na mesma porta da API.** Ao iniciar o EasyFood e acessar **http://localhost:3000**, o Express entrega a página inicial automaticamente.

Em [`easyfood/src/app.js`](easyfood/src/app.js), esta configuração disponibiliza o frontend:

```js
app.use(express.static(path.join(__dirname, "../public")));
```

Não é necessário iniciar outro servidor, usar Live Server ou executar um build do frontend. Abra a aplicação pelo endereço HTTP acima, e não diretamente pelo arquivo HTML: os módulos JavaScript e as chamadas relativas à API dependem do servidor.

## Estrutura do repositório

```text
unifecaf-software-architecture/
├── README.md
├── atividades/              # Enunciados e materiais das atividades
└── easyfood/
    ├── public/              # Frontend servido pelo Express
    │   ├── index.html       # Listagem e criação de restaurantes
    │   ├── login.html       # Login e cadastro de usuários
    │   ├── css/
    │   └── js/
    ├── src/                 # API: rotas, controllers e services
    ├── prisma/              # Schema, migrations e dados de exemplo
    ├── test/                # Testes automatizados
    ├── docs/                # Documentação e decisões de arquitetura
    ├── .env.example         # Modelo de configuração local
    ├── package.json
    └── server.js            # Inicialização do servidor na porta 3000
```

## Como rodar o EasyFood

### 1. Pré-requisitos

- Node.js compatível com o Prisma instalado: `20.19.x` ou superior na linha 20, `22.12.x` ou superior na linha 22, ou versão 24 ou superior. O projeto foi executado com Node.js 24.
- npm instalado junto com o Node.js.
- PostgreSQL em execução e um usuário com acesso ao banco do projeto.

### 2. Instalar as dependências

No terminal, a partir da raiz deste repositório:

```sh
cd easyfood
npm ci
```

**Execute os próximos comandos dentro da pasta `easyfood`.**

### 3. Configurar o ambiente

Copie `.env.example` para `.env`.

No Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

No Linux ou macOS:

```sh
cp .env.example .env
```

Se o `.env` já existir, ajuste o arquivo existente sem sobrescrever suas configurações. Preencha as variáveis:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/easyfood"
JWT_SECRET="substitua-por-uma-chave-longa-e-aleatoria"
```

- `DATABASE_URL`: substitua usuário, senha, host, porta e nome do banco pelos valores do seu PostgreSQL. A URL acima é apenas um exemplo de configuração local.
- `JWT_SECRET`: chave usada para assinar os tokens de autenticação. Para gerar um valor aleatório, execute `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` e copie o resultado para essa variável.

O arquivo `.env` está no `.gitignore` e não deve ser versionado.

### 4. Preparar o banco

Crie um banco chamado `easyfood` no PostgreSQL, por exemplo pelo pgAdmin ou executando o SQL abaixo com um usuário que tenha permissão para criar bancos:

```sql
CREATE DATABASE easyfood;
```

Caso use outro nome, ajuste também a `DATABASE_URL`. Se o banco já existir, não é necessário criá-lo novamente.

No terminal, gere o Prisma Client e aplique as migrations existentes:

```sh
npx prisma generate
npx prisma migrate deploy
```

Opcionalmente, insira três restaurantes de exemplo:

```sh
npm run seed
```

Execute o seed apenas uma vez se quiser evitar repetições: o modelo atual não possui uma restrição de unicidade para o nome dos restaurantes, então novas execuções podem duplicar os exemplos.

### 5. Iniciar a aplicação

```sh
npm start
```

O terminal deve exibir:

```text
EasyFood rodando na porta 3000
```

Acesse:

- **Frontend:** [http://localhost:3000](http://localhost:3000).
- **Login e cadastro:** [http://localhost:3000/login.html](http://localhost:3000/login.html).
- **Listagem da API em JSON:** [http://localhost:3000/restaurants](http://localhost:3000/restaurants).

Mantenha o terminal em execução enquanto usa a aplicação. Para encerrar o servidor, pressione `Ctrl+C`.

## Funcionalidades da interface

- Consulta pública de restaurantes, sem necessidade de login.
- Busca por nome, filtro por categoria e ordenação por nome ou nota.
- Cadastro de usuários, login e logout.
- Cadastro de restaurantes para usuários autenticados, por meio de um modal.
- Validação de formulários e mensagens de carregamento, sucesso e erro.
- Layout adaptado para computadores e celulares.

A nota do restaurante é informada no cadastro, entre 0 e 5; não representa uma média de avaliações de usuários. O token de autenticação é mantido no `sessionStorage` da aba.

## Rotas da API

| Método | Rota | Autenticação | Finalidade |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Pública | Cadastrar usuário |
| `POST` | `/auth/login` | Pública | Entrar e obter um token JWT |
| `GET` | `/auth/me` | Bearer token | Verificar a sessão |
| `GET` | `/restaurants` | Pública | Listar restaurantes |
| `POST` | `/restaurants` | Bearer token | Cadastrar restaurante |

O frontend utiliza essas rotas no mesmo endereço do servidor Express.

## Testes

Dentro da pasta `easyfood`, execute:

```sh
npm test
```

Os testes existentes verificam cadastro, autenticação, validações e proteção de rotas.

## Documentação complementar

- [Frontend: organização e comportamento](easyfood/docs/frontend.md).
- [Módulo de autenticação](easyfood/src/modules/auth/README.md).
- [Decisões de arquitetura (ADRs)](easyfood/docs/adr/).
- [Materiais das atividades](atividades/).
