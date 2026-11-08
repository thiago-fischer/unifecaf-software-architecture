# Atividade 8 — Evoluindo a EasyFood

## Correção de bugs e implementação de upload de imagens

A EasyFood continua evoluindo!

Nas últimas aulas, implementamos o cadastro de restaurantes, autenticação com JWT, persistência com Prisma e PostgreSQL e organizamos nossa aplicação utilizando uma arquitetura modular.

Também estudamos o processamento de imagens e discutimos diferentes alternativas arquiteturais, incluindo Serverless e FaaS.

Agora temos duas novas missões: corrigir um problema no cadastro de pratos e implementar o upload de imagens para o perfil do usuário e para os pratos do cardápio.

## Parte 1 — Corrigindo o cadastro de pratos

Durante a evolução da EasyFood, identificamos um problema no funcionamento do cadastro de pratos.

O repositório disponibilizado pelo professor já contém a correção desse problema.

Sua missão:

1. Atualize seu projeto utilizando o repositório disponibilizado.
2. Identifique quais arquivos foram alterados para corrigir o problema.
3. Analise o que estava causando o erro.
4. Entenda como a correção foi implementada.
5. Execute a aplicação e confirme que o cadastro de pratos está funcionando corretamente.

Teste o endpoint:

```
POST /restaurants/:restaurantId/dishes
```

Utilize um restaurante existente e envie os dados necessários para cadastrar um prato.

Resultado esperado: o prato deverá ser cadastrado corretamente no PostgreSQL e associado ao restaurante informado.

O objetivo desta etapa não é apenas copiar o código corrigido, mas compreender o problema e a solução aplicada.

## Parte 2 — Implementando o upload de imagem do perfil do usuário

Agora precisamos permitir que os usuários da EasyFood adicionem uma foto ao próprio perfil.

Atualmente, já possuímos um módulo de autenticação responsável pelo cadastro e login dos usuários.

Vamos evoluir essa funcionalidade.

Sua missão:

- Adicionar ao modelo `User` um campo para armazenar o caminho da imagem de perfil, caso ainda não exista.
- Criar uma rota para permitir o envio da imagem.
- Utilizar Multer para receber o arquivo.
- Utilizar Sharp para otimizar a imagem.
- Armazenar a imagem processada.
- Atualizar o usuário no PostgreSQL com o caminho da imagem.
- Permitir consultar a imagem posteriormente.

Sugestão de endpoint:

```
POST /auth/me/image
```

Essa rota deverá exigir autenticação com JWT.

Importante: a imagem deverá ser associada ao usuário autenticado, identificado pelo token, e não a um identificador informado livremente na requisição.

## Parte 3 — Implementando imagens nos pratos

Agora vamos permitir que cada prato cadastrado na EasyFood possua sua própria imagem.

Sua missão:

- Verificar se o modelo `Dish` possui o campo `imageUrl`.
- Criar ou finalizar a rota de upload de imagem para um prato.
- Receber o arquivo utilizando Multer.
- Processar a imagem utilizando Sharp.
- Armazenar a imagem otimizada.
- Atualizar o prato no banco de dados com o caminho da imagem.
- Garantir que a consulta do cardápio retorne a imagem associada ao prato.

Sugestão de endpoint:

```
POST /dishes/:dishId/image
```

A rota deverá exigir autenticação com JWT.

## Parte 4 — Reutilizando o serviço de imagens

Atenção: não queremos implementar a mesma lógica de processamento duas vezes.

Durante as aulas, trabalhamos com a ideia de serviços compartilhados, que podem ser reutilizados por diferentes módulos.

Aproveite essa organização para que tanto o módulo de usuários quanto o módulo de pratos utilizem o mesmo serviço de processamento de imagens.

Estrutura sugerida:

```
src/
└── modules/
    ├── auth/
    │   ├── auth.routes.js
    │   ├── auth.controller.js
    │   └── auth.service.js
    │
    ├── dishes/
    │   ├── dish.routes.js
    │   ├── dish.controller.js
    │   └── dish.service.js
    │
    └── shared/
        ├── email.service.js
        ├── image.service.js
        └── upload.middleware.js
```

O `image.service.js` deverá concentrar a responsabilidade de otimizar e armazenar imagens, independentemente de qual módulo solicitou a operação.

## Parte 5 — Testando a implementação

Após finalizar, realizem os seguintes testes:

| Teste                                 | Resultado esperado          |
| ------------------------------------- | --------------------------- |
| Cadastrar um prato                    | `201 Created`               |
| Enviar foto para o perfil autenticado | Imagem vinculada ao usuário |
| Enviar foto para um prato             | Imagem vinculada ao prato   |
| Consultar os dados atualizados        | Caminho da imagem retornado |
| Acessar a URL da imagem               | Imagem exibida              |
| Enviar imagem sem JWT                 | `401 Unauthorized`          |
| Enviar arquivo inválido               | Erro HTTP adequado          |
| Enviar imagem para prato inexistente  | `404 Not Found`             |

O upload deverá aceitar imagens nos formatos JPEG, PNG ou WebP, respeitando um limite de tamanho definido na aplicação.

## Parte 6 — Pense como arquiteto

Durante o desenvolvimento, reflita sobre as seguintes questões:

- Por que faz sentido reutilizar o mesmo serviço de imagens?
- Qual é a responsabilidade do Controller e qual é a responsabilidade do Service?
- Por que não devemos implementar o processamento diretamente nas rotas?
- Como o middleware de autenticação protege a alteração da imagem de perfil?
- O que deve acontecer se o processamento de uma imagem falhar?
- Nossa arquitetura atual permite adicionar novas funcionalidades sem modificar toda a aplicação?

O objetivo é aplicar os conceitos de separação de responsabilidades, baixo acoplamento e reutilização de componentes.

## Atividade concluída quando

- O repositório atualizado foi utilizado.
- A correção do cadastro de pratos foi analisada e compreendida.
- O cadastro de pratos está funcionando.
- O usuário autenticado consegue adicionar uma imagem ao perfil.
- Os pratos conseguem receber imagens.
- As imagens são otimizadas utilizando Sharp.
- O processamento é reutilizado pelos módulos.
- Os caminhos das imagens são armazenados no PostgreSQL.
- As imagens podem ser acessadas pelo navegador.
- As rotas de upload estão protegidas com JWT.
- As funcionalidades anteriores continuam funcionando.

## Entrega

Publiquem as alterações no repositório GitHub da EasyFood.

O projeto deverá demonstrar três funcionalidades:

1. Cadastro de pratos funcionando após a correção.
2. Upload de imagem para o perfil do usuário autenticado.
3. Upload de imagem para um prato cadastrado.

Lembrem-se: mais importante do que apenas fazer o código funcionar é compreender como evoluir uma aplicação existente, corrigir problemas e reutilizar componentes sem comprometer sua arquitetura.

Pratique. Evolua. Conquiste.