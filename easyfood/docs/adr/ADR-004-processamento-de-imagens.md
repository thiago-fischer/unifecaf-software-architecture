# ADR-004 - Processamento de imagens

## Contexto

A EasyFood precisa receber imagens dos pratos do cardápio e dos perfis de usuário, otimizá-las antes do armazenamento e manter o caminho da versão processada no cadastro correspondente. O processamento reduz o impacto de imagens grandes no tempo de transferência e no consumo de dados.

## Alternativas consideradas

- Processar as imagens dentro da API EasyFood.
- Criar um serviço independente de processamento de imagens.
- Utilizar Serverless/FaaS para processar imagens.

## Decisão

Manter o processamento de imagens dentro da API EasyFood.

## Justificativa

O projeto possui baixo volume inicial de imagens, já conta com a infraestrutura da API e está em contexto acadêmico. A alternativa escolhida prioriza simplicidade, facilidade de implementação e aproveitamento da infraestrutura existente.

## Consequências

### Vantagens

- Menor complexidade inicial.
- Menos componentes para configurar.
- Aproveitamento da infraestrutura existente.

### Limitações

- Consumo de CPU e memória da API.
- Possível impacto em outras requisições.
- Necessidade de reavaliar a solução caso o volume cresça.

O serviço compartilhado recebe o tipo da imagem (`dish` ou `profile`) e define o diretório de armazenamento internamente. Assim, os módulos de pratos e autenticação reutilizam a mesma otimização com Sharp sem conhecer detalhes de arquivos ou repetir essa lógica.

Serverless não é inadequado; apenas não é a alternativa que melhor atende às necessidades atuais da EasyFood.
