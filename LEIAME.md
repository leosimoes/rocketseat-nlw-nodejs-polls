# Rocketseat - NLW - NodeJS - Polls
Projeto de evento NLW da Rocketseat que usa NodeJS para criar API Rest e websockets de Polls.


## Passos
Os passos para desenvolver o projeto são:
1. Criar o projeto NodeJS no WebStorm:

![Image-01-WebStorm-NodeJS](imgs/Image-01-WebStorm-NodeJS.jpg)

2. Instalar e configurar **Typescript** pelo terminal com:
- `npm install typescript @types/node -D`;
- `npx tsc --init`;
- `npm install tsx -D`.

3. Configurar servidor:
- Criar arquivo `src/http/server.ts`;
- Em `package.json`, adicionar `"scripts": {"dev": "tsx watch src/http/server.ts"}`;
- Testar a execução pelo terminal com `npm run dev`.

4. Instalar e usar o framework fastify:
- No terminal, digite `npm i fastify`;
- Altere o arquivo `src/http/server.ts`:

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

- Testar a rota `http://localhost:3333/hello` no navegador após iniciar o servidor com `npm run dev`.

![Image-02-Test-HelloRoute](imgs/Image-02-Test-HelloRoute.jpg)

5. Instalar e configurar o Docker:
- Baixar e instalar o Docker Desktop de acordo com o Sistema Operacional: `https://docs.docker.com/get-docker/`;
- Ativar a virtualização na BIOS do Computador: `Advanced -> CPU Configuration -> SVM Mode = Enabled`;
- Executar o Docker Desktop (e o WebStorm) como Administrador;
- No terminal, para verificar a versão instalada do Docker, digite `docker -v`;
- No terminal, para verificar os containers do Docker em execução, digite `docker ps`;
- Criar o arquivo `docker-compose.yml` cujo contéudo indica quais serviços que a aplicação precisa;

```yaml
version: '3.7'

services:
  postgres:
    image: bitnami/postgresql:latest
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_USER=docker
      - POSTGRESQL_PASSWORD=docker
      - POSTGRESQL_DATABASE=polls
    volumes:
      - polls_pg_data:/bitnami/postgresql

  redis:
    image: bitnami/redis:latest
    ports:
      - '6379:6379'
    environment:
      - ALLOW_EMPTY_PASSWORD=yes
    volumes:
      - polls_redis_data:/bitnami/redis/data

volumes:
  polls_pg_data:
  polls_redis_data:
```

- No terminal, para rodar os serviços do container em background, digite `docker compose up -d`;
- No terminal, para exibir os logs de um dos containers, digite `docker logs <id>`.

6. Instalar o Prisma e configurar o Prisma ORM:
- No terminal, digite `npm i -d prisma` para instalar o Prisma;
- No terminal, digite `npx prisma init`;
- alterar o arquivo gerado `.env`:
  - de `DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"`;
  - para `DATABASE_URL="postgresql://docker:docker@localhost:5432/polls?schema=public"`
- alterar o arquivo gerado `prisma/schema.prisma`:

```prisma
model Poll {
  id        String @id @default(uuid())
  title     String
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now())
}
```

- No terminal, digite `npx prisma migrate dev` e depois `create polls` para criar migration
- No terminal, digite `npx prisma studio` para abrir interface no navegador em `http://localhost:5555/`.

7. Criar rota `POST /polls`:
- Instalar zod para validação: `npm install zod`;
- Alterar o arquivo `src/http/server.ts`:

```typescript
import fastify from 'fastify'
import {z} from 'zod'
import {PrismaClient} from '@prisma/client'

const app = fastify();
const prisma = new PrismaClient();

app.post('/polls', async (request, reply)=>{
    const createPollBody = z.object({
        title: z.string()
    });
    const {title} = createPollBody.parse(request.body);
    const poll = await prisma.poll.create({
        data: {
            title
        }
    });
    return reply.status(201).send({pollId: poll.id})
});

app.listen({port: 3333}).then(()=>{
    console.log('HTTP server running!');
});
```

- Testar endpoint `POST http://localhost:3333/polls` com Postman:
```json
{
  "title": "test1"
}
```


## Referências
Docker Hub - bitnami - Postgresql:
https://hub.docker.com/r/bitnami/postgresql

Docker Hub - bitnami - Redis:
https://hub.docker.com/r/bitnami/redis

Prisma:
https://www.prisma.io/orm