# Referência da API EasyFood

Base local: `http://localhost:3000`.

As rotas protegidas exigem o cabeçalho `Authorization: Bearer <token>`. O token é retornado pelo login, usa HS256 e expira em um dia.

## Autenticação

### Criar conta

`POST /auth/register`

```json
{
  "name": "Aluno",
  "email": "aluno@easyfood.com",
  "password": "senha123"
}
```

Retorna `201 Created` com o usuário, sem a senha.

### Entrar

`POST /auth/login`

```json
{
  "email": "aluno@easyfood.com",
  "password": "senha123"
}
```

Retorna `200 OK` com `{ "token", "user" }`.

### Consultar a sessão

`GET /auth/me` (protegida)

Retorna o usuário atualizado, incluindo `imageUrl` quando uma foto de perfil foi enviada.

### Enviar foto de perfil

`POST /auth/me/image` (protegida)

Envie `multipart/form-data` com o campo de arquivo `image`. São aceitos JPEG, PNG e WebP de até 5 MB. A API corrige a orientação quando aplicável, limita a largura a 800 px, converte para WebP com qualidade 80 e armazena o caminho em `User.imageUrl`.

O usuário é obtido apenas do JWT. Uma tentativa sem token retorna `401`; sem arquivo, `400`.

## Restaurantes e cardápio

| Método | Rota | Protegida | Resultado |
| --- | --- | --- | --- |
| GET | `/restaurants` | Não | Lista restaurantes |
| POST | `/restaurants` | Sim | Cria restaurante pertencente ao usuário autenticado |
| GET | `/restaurants/:restaurantId/dishes` | Não | Lista pratos do restaurante |
| POST | `/restaurants/:restaurantId/dishes` | Sim | Cria prato associado ao restaurante |
| GET | `/dishes/:dishId` | Não | Consulta um prato |
| PUT | `/dishes/:dishId` | Sim | Atualiza um prato |
| DELETE | `/dishes/:dishId` | Sim | Exclui um prato |
| POST | `/dishes/:dishId/image` | Sim | Envia a imagem de um prato |

Ao criar um restaurante, o usuário autenticado torna-se seu proprietário. Somente ele pode criar, editar e excluir pratos ou alterar suas imagens. Tentativas de outro usuário retornam `403 Forbidden`.

O restaurante retornado contém `ownerId`. Esse valor é definido pela API a partir do JWT; um `ownerId` enviado no corpo é ignorado.

Para criar um prato, envie JSON:

```json
{
  "name": "Pizza Margherita",
  "category": "Pizzas",
  "description": "Molho de tomate, queijo e manjericão",
  "price": 49.9
}
```

O envio de imagem de prato também usa `multipart/form-data` e o campo `image`. Um prato inexistente retorna `404`.

## E-mails e registro de atividades

Após cadastrar um restaurante, a API tenta enviar uma mensagem de boas-vindas ao e-mail do proprietário e um aviso comercial para `EMAIL_TO`. Essas tarefas são secundárias: uma falha no provedor de e-mail não desfaz o restaurante criado.

A criação de restaurantes e a criação, atualização, exclusão ou troca de imagem de pratos geram registros internos em `Activity`. Não existe uma rota pública para consultar essas atividades. Assim como o e-mail, uma falha nesse registro é reportada no console sem invalidar a operação principal.

## Respostas de erro relevantes

| Status | Situação |
| --- | --- |
| `400 Bad Request` | Dados obrigatórios ou identificadores inválidos |
| `401 Unauthorized` | Token ausente, inválido ou expirado |
| `403 Forbidden` | Usuário autenticado não é proprietário do restaurante |
| `404 Not Found` | Usuário, restaurante ou prato não encontrado |
| `409 Conflict` | E-mail já cadastrado |
| `413 Payload Too Large` | Imagem acima do limite de 5 MB |

## Arquivos de imagem

Os arquivos processados ficam disponíveis publicamente pelos caminhos retornados em `imageUrl`:

- Perfil: `/uploads/profiles/<arquivo>.webp`
- Prato: `/uploads/dishes/<arquivo>.webp`

Essas URLs podem ser abertas diretamente no navegador sem token.
