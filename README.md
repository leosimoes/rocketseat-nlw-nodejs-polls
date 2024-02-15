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
