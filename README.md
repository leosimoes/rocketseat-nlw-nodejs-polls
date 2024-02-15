# Rocketseat - NLW - NodeJS - Polls
Rocketseat NLW event project using NodeJS to create Rest API and poll websockets.


## Steps
The steps to develop the project are:
1. Create the NodeJS project in WebStorm:

![Image-01-WebStorm-NodeJS](imgs/Image-01-WebStorm-NodeJS.jpg)

2. Install and configure **Typescript** through the terminal with:
- `npm install typescript @types/node -D`
- `npx tsc --init`
- `npm install tsx -D`

3. Configure Server:
- Create file `src/http/server.ts`;
- In `package.json`, add `"scripts": {"dev": "tsx watch src/http/server.ts"}`;
- Test execution through the terminal with `npm run dev`.

4. Install and use the fastify framework:
- In the terminal, type `npm i fastify`
- Change the `src/http/server.ts` file:

```typescript
import fastify from 'fastify'

const app = fastify();

app.get('/hello', () => {
     return 'Hello NLW';
});

app.listen({port: 3333}).then(()=>{
     console.log('HTTP server running!');
});
```

- Test the `http://localhost:3333/hello` route in the browser after starting the server with `npm run dev`.

![Image-02-Test-HelloRoute](imgs/Image-02-Test-HelloRoute.jpg)
