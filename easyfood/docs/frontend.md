# Frontend EasyFood

Frontend em HTML, CSS e JavaScript vanilla, servido pelo próprio Express.

## Executar

Com as dependências, o banco e o `.env` do backend configurados, execute `npm start` dentro de `easyfood` e abra http://localhost:3000. Não abra os arquivos HTML diretamente: os módulos e as chamadas à API dependem do servidor HTTP.

## Estrutura

- `public/index.html`: catálogo e modal de criação de restaurantes.
- `public/login.html`: login e cadastro de usuários.
- `public/css/global.css`: estilos compartilhados e adaptações para celular.
- `public/js/services/`: requisições HTTP e gerenciamento de sessão.
- `public/js/pages/`: eventos e estado de cada tela.
- `public/js/components/`: criação segura dos cards usando `textContent`.

Os scripts usam módulos nativos (`type="module"`). Não há etapa de build nem dependências JavaScript adicionais. As fontes do Google Fonts são opcionais; fontes locais substitutas são usadas quando não há conexão.

## Comportamento

A consulta é pública. Busca por nome (ignorando acentos), filtro por categoria e ordenação operam na lista recebida de `/restaurants`. A nota mostrada é a informada no cadastro, não uma média de avaliações.

Para criar um restaurante, o usuário precisa entrar. Após criar uma conta, a tela solicita o login. O retorno ao formulário de restaurante é preservado durante esse fluxo.

O token fica no `sessionStorage` da aba. O botão Sair remove a sessão; respostas 401 de rotas autenticadas invalidam o token. Uma sessão existente é verificada em `/auth/me` ao abrir a página inicial. Nunca são armazenadas senhas pelo frontend.

Campos de nome e categoria são obrigatórios. A nota opcional aceita valores de 0 a 5, com uma casa decimal; se omitida, o backend usa zero. Os formulários exibem os erros da API e bloqueiam envios duplicados enquanto aguardam a resposta.
