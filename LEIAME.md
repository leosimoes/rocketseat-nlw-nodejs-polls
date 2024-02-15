# Rocketseat - NLW - NodeJS - Polls
Projeto de evento NLW da Rocketseat que usa NodeJS para criar API Rest e websockets de Polls.


## Passos
Os passos para desenvolver o projeto são:
1. Criar o projeto NodeJS no WebStorm:

![Image-01-WebStorm-NodeJS](imgs/Image-01-WebStorm-NodeJS.jpg)

2. Instalar e configurar **Typescript** pelo terminal com:
- `npm install typescript @types/node -D`
- `npx tsc --init`
- `npm install tsx -D`

3. Configurar servidor:
- Criar arquivo `src/http/server.ts`;
- Em `package.json`, adicionar `"scripts": {"dev": "tsx watch src/http/server.ts"}`;
- Testar a execução pelo terminal com `npm run dev`.
