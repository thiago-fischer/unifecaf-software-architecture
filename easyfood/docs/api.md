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
| POST | `/restaurants` | Sim | Cria restaurante |
| GET | `/restaurants/:restaurantId/dishes` | Não | Lista pratos do restaurante |
| POST | `/restaurants/:restaurantId/dishes` | Sim | Cria prato associado ao restaurante |
| POST | `/dishes/:dishId/image` | Sim | Envia a imagem de um prato |

Para criar um prato, envie JSON:

```json
{
  "name": "Pizza Margherita",
  "description": "Molho de tomate, queijo e manjericão",
  "price": 49.9
}
```

O envio de imagem de prato também usa `multipart/form-data` e o campo `image`. Um prato inexistente retorna `404`.

## Arquivos de imagem

Os arquivos processados ficam disponíveis publicamente pelos caminhos retornados em `imageUrl`:

- Perfil: `/uploads/profiles/<arquivo>.webp`
- Prato: `/uploads/dishes/<arquivo>.webp`

Essas URLs podem ser abertas diretamente no navegador sem token.
