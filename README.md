# Arquitetura de Software — EasyFood

Repositório das atividades de Arquitetura de Software da UniFECAF. O projeto **EasyFood** permite consultar e cadastrar restaurantes e seus cardápios, com cadastro de usuários, autenticação JWT e autorização baseada na propriedade do restaurante.

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
EMAIL_API_KEY="sua-chave-do-resend"
EMAIL_FROM="onboarding@resend.dev"
EMAIL_FROM_NAME="EasyFood"
EMAIL_TO="email-do-comercial@exemplo.com"
```

- `DATABASE_URL`: substitua usuário, senha, host, porta e nome do banco pelos valores do seu PostgreSQL. A URL acima é apenas um exemplo de configuração local.
- `JWT_SECRET`: chave usada para assinar os tokens de autenticação. Para gerar um valor aleatório, execute `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` e copie o resultado para essa variável.
- `EMAIL_API_KEY`, `EMAIL_FROM` e `EMAIL_FROM_NAME`: credenciais e remetente usados pelo Resend.
- `EMAIL_TO`: endereço que recebe o aviso comercial quando um restaurante é cadastrado. O e-mail de boas-vindas é enviado ao endereço do proprietário autenticado.

Se as configurações de e-mail estiverem ausentes ou o provedor falhar, o restaurante continua sendo cadastrado e o erro é registrado no console.

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

Se você já possuía dados anteriores à migração de propriedade, a inclusão de `ownerId` e da categoria obrigatória dos pratos exige associar os registros antigos manualmente. Em um banco exclusivamente local, também é possível apagar os dados e reaplicar todas as migrations com `npx prisma migrate reset`; esse comando é destrutivo e nunca deve ser executado em produção.

Opcionalmente, crie um usuário de demonstração e três restaurantes pertencentes a ele:

```sh
npm run seed
```

Execute o seed apenas uma vez se quiser evitar repetições: o modelo atual não possui uma restrição de unicidade para o nome dos restaurantes, então novas execuções podem duplicar os exemplos.

Credenciais criadas pelo seed:

```text
E-mail: demo@easyfood.com
Senha: easyfood123
```

Use essas credenciais somente no ambiente local de desenvolvimento.

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

- Cadastro, edição e exclusão de pratos pelo proprietário do restaurante.
- Consulta pública do cardápio de cada restaurante.
- Upload de imagens de pratos pelo proprietário, com otimização para WebP.
- Upload autenticado de foto de perfil, com otimização para WebP.
- Consulta pública de restaurantes, sem necessidade de login.
- Busca por nome, filtro por categoria e ordenação por nome ou nota.
- Cadastro de usuários, login e logout.
- Cadastro de restaurantes para usuários autenticados, que passam a ser seus proprietários.
- Validação de formulários e mensagens de carregamento, sucesso e erro.
- Layout adaptado para computadores e celulares.

A nota do restaurante é informada no cadastro, entre 0 e 5; não representa uma média de avaliações de usuários. O token de autenticação é mantido no `sessionStorage` da aba.

## Rotas da API

| Método | Rota | Autenticação | Finalidade |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Pública | Cadastrar usuário |
| `POST` | `/auth/login` | Pública | Entrar e obter um token JWT |
| `GET` | `/auth/me` | Bearer token | Verificar a sessão |
| `POST` | `/auth/me/image` | Bearer token | Enviar a foto do usuário autenticado |
| `GET` | `/restaurants` | Pública | Listar restaurantes |
| `POST` | `/restaurants` | Bearer token | Cadastrar restaurante |
| `GET` | `/restaurants/:restaurantId/dishes` | Pública | Listar os pratos de um restaurante |
| `POST` | `/restaurants/:restaurantId/dishes` | Proprietário | Cadastrar um prato no restaurante |
| `GET` | `/dishes/:dishId` | Pública | Consultar um prato |
| `PUT` | `/dishes/:dishId` | Proprietário | Atualizar um prato |
| `DELETE` | `/dishes/:dishId` | Proprietário | Excluir um prato |
| `POST` | `/dishes/:dishId/image` | Proprietário | Enviar e otimizar a imagem de um prato |

As rotas indicadas como “Proprietário” exigem um Bearer token e verificam se o usuário autenticado é o dono do restaurante. Outro usuário recebe `403 Forbidden`. O frontend utiliza essas rotas no mesmo endereço do servidor Express.

## Cardápio e imagens

Cada prato possui nome, categoria, descrição, preço, restaurante associado e uma imagem opcional. Para cadastrar um prato, envie um JSON para `POST /restaurants/:restaurantId/dishes`:

```json
{
  "name": "Pizza Margherita",
  "category": "Pizzas",
  "description": "Molho de tomate, queijo e manjericão",
  "price": 49.90
}
```

Para adicionar uma imagem, envie uma requisição `multipart/form-data` para `POST /dishes/:dishId/image`, usando o campo de arquivo `image`. São aceitos arquivos JPEG, PNG e WebP de até 5 MB. A API corrige a orientação quando aplicável, limita a largura a 800 px, converte o resultado para WebP com qualidade 80 e salva a versão otimizada em `easyfood/uploads/dishes/`.

As imagens são expostas publicamente pelo caminho retornado em `imageUrl`, como `/uploads/dishes/arquivo.webp` ou `/uploads/profiles/arquivo.webp`. Os arquivos WebP gerados são ignorados pelo Git; as pastas são criadas automaticamente pela API e possuem um `.gitkeep` para preservar sua estrutura no repositório.

Para enviar uma foto de perfil, faça uma requisição `multipart/form-data` para `POST /auth/me/image`, com o campo de arquivo `image` e um Bearer token. A imagem é vinculada exclusivamente ao usuário identificado pelo token; nenhum identificador de usuário é aceito na URL ou no corpo da requisição.

## Testes

Dentro da pasta `easyfood`, execute:

```sh
npm test
```

Os testes verificam cadastro, autenticação, validações, propriedade dos restaurantes, CRUD de pratos, proteção de rotas e uploads de perfil e pratos.

## Documentação complementar

- [Frontend: organização e comportamento](easyfood/docs/frontend.md).
- [Módulo de autenticação](easyfood/src/modules/auth/README.md).
- [Decisões de arquitetura (ADRs)](easyfood/docs/adr/).
- [Decisão sobre processamento de imagens](easyfood/docs/adr/ADR-004-processamento-de-imagens.md).
- [Decisão sobre propriedade e autorização](easyfood/docs/adr/ADR-005-propriedade-e-autorizacao-de-restaurantes.md).
- [Referência completa da API](easyfood/docs/api.md).
- [Materiais das atividades](atividades/).
