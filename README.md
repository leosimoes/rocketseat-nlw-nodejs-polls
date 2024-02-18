# Rocketseat - NLW - NodeJS - Polls
Rocketseat NLW event project using NodeJS to create Rest API and poll websockets.


## Steps
The steps to develop the project are:
1. Create the NodeJS project in WebStorm:

![Image-01-WebStorm-NodeJS](imgs/Image-01-WebStorm-NodeJS.jpg)

2. Install and configure **Typescript** through the terminal with:
- `npm install typescript @types/node -D`;
- `npx tsc --init`;
- `npm install tsx -D`.

3. Configure Server:
- Create file `src/http/server.ts`;
- In `package.json`, add `"scripts": {"dev": "tsx watch src/http/server.ts"}`;
- Test execution through the terminal with `npm run dev`.

4. Install and use the fastify framework:
- In the terminal, type `npm i fastify`;
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

5. Install and configure Docker:
- Download and install Docker Desktop according to the Operating System: `https://docs.docker.com/get-docker/`;
- Activate virtualization in the Computer BIOS: `Advanced -> CPU Configuration -> SVM Mode = Enabled`;
- Run Docker Desktop (and WebStorm) as Administrator;
- In the terminal, to check the installed version of Docker, type `docker -v`;
- In the terminal, to check the running Docker containers, type `docker ps`;
- Create the file `docker-compose.yml` whose content indicates which services the application needs;

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

- In the terminal, to run the container services in the background, type `docker compose up -d`;
- In the terminal, to display the logs of one of the containers, type `docker logs <id>`.

6. Install Prisma and configure Prisma ORM:
- In the terminal, type `npm i -d prisma` to install Prisma;
- In the terminal, type `npx prism init`;
- change the generated file `.env`:
    - from `DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"`;
    - for `DATABASE_URL="postgresql://docker:docker@localhost:5432/polls?schema=public"`
- change the generated file `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Poll {
   id String @id @default(uuid())
   title String
   createdAt DateTime @default(now())
   updatedAt DateTime @default(now())
}
```

- In the terminal, type `npx prisma migrate dev` and then `create polls` to create migration
- In the terminal, type `npx prisma studio` to open the browser interface at `http://localhost:5555/`.

7. Create `POST /polls` route:
- Install zod for validation: `npm install zod`;
- Change the file `src/http/server.ts`:

```typescript
import fastify from 'fastify'
import {z} from 'zod'
import {PrismaClient} from '@prisma/client'

const app = fastify();
const prism = new PrismaClient();

app.post('/polls', async (request, reply)=>{
     const createPollBody = z.object({
         title: z.string()
     });
     const {title} = createPollBody.parse(request.body);
     const poll = await prisma.poll.create({
         date: {
             title
         }
     });
     return reply.status(201).send({pollId: poll.id})
});

app.listen({port: 3333}).then(()=>{
     console.log('HTTP server running!');
});
```

- Test endpoint `POST http://localhost:3333/polls` with Postman:
```json
{
   "title": "test1"
}
```

You must separate the creation of the database connection from the route definition,
and each route must be in a file and must export an async function.

8. Refactor the code and create `PollOption`:
- Change `prisma/schema.prisma` by adding `PollOption` and changing `Poll`:

```prisma
model Poll {
   options PollOption[]
}

model PollOption {
   id String @id @default(uuid())
   title String
   pollId String

   poll Poll @relation(fields: [pollId], references: [id])
}
```

- In the terminal, type `npx prisma migrate dev` and then `create polls options` to create migration;
- Create file `src/lib/prisma.ts`:

```typescript
import {PrismaClient} from '@prisma/client'

export const prism = new PrismaClient({
     log: ['query']
});
```

- Create file `src/http/routes/create-poll.ts`:

```typescript
import { z } from "zod";
import { prism } from '../../lib/prisma'
import { FastifyInstance} from "fastify";

export async function createPoll(app: FastifyInstance){

   app.post('/polls', async (request, reply)=>{
     const createPollBody = z.object({
       title: z.string(),
       options: z.array(z.string())
     });

     const {title, options} = createPollBody.parse(request.body);

     const poll = await prisma.poll.create({
       date: {
         title,
         options: {
           createMany: {
             data: options.map(option => {
               return {title: option}
             })
           }
         }
       }
     });

     return reply.status(201).send({pollId: poll.id})
   })
}
```

- Change `src/http/server.ts` to use the route defined in the other file:

```typescript
import fastify from 'fastify'
import {createPoll} from "./routes/create-poll";

const app = fastify();

app.register(createPoll);

app.listen({port: 3333}).then(()=>{
     console.log('HTTP server running!');
});
```

9. Create `GET /polls` route:
- Create file `src/http/routes/get-poll.ts`:

```typescript
import { z } from "zod";
import { prism } from '../../lib/prisma'
import { FastifyInstance} from "fastify";

export async function getPoll(app: FastifyInstance){
     app.get('/polls/:pollId', async(request, reply) =>{
         const getPollParams = z.object({
             pollId: z.string().uuid()
         })
         const { pollId } = getPollParams.parse(request.params);
         const poll = await prisma.poll.findUnique({
            Onde: {
                id: pollId
            },
             include: {
                options: {
                    select: {
                        id: true,
                        title: true
                    }
                }
             }
         });

         return reply.send({ poll });
     })
}
```

- Change the file `src/http/server.ts`:

```typescript
import { getPoll } from "./routes/get-poll";
app.register(getPoll);
```

10. Create route `POST /polls/:pollId/votes`:
- In the terminal, type `npm i @fastify/cookie` to be able to use cookies;
- Create file `src/http/routes/vote-on-poll.ts`:

```typescript
import { z } from "zod"
import { randomUUID} from "crypto";
import { prism } from '../../lib/prisma'
import { FastifyInstance } from "fastify"

export async function voteOnPoll(app: FastifyInstance) {
   app.post('/polls/:pollId/votes', async(request, reply) =>{
     const voteOnPollBody = z.object({
       pollOptionId: z.string().uuid()
     })

     const voteOnPollParams = z.object({
       pollId: z.string().uuid()
     })

     const { pollId } = voteOnPollParams.parse(request.params)
     const { pollOptionId } = voteOnPollBody.parse(request.body)

     let { sessionId } = request.cookies

     if(!sessionId){
       sessionId = randomUUID()
       reply.setCookie('sessionId', sessionId, {
         path: '/',
         maxAge: 60*60*24*30,
         signed: true,
         httpOnly: true
       })
     } else {
       const userPreviousVoteOnPoll = await prisma.vote.findUnique({
         Onde: {
           sessionId_pollId: {
             sessionId,
             pollId
           }
         }
       });

       if(userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionId == pollOptionId){
         return reply.status(400).send({
           message: "You already voted on this poll."
         })
       } else if (userPreviousVoteOnPoll){
         await prisma.vote.delete({
           Onde: {
             id: userPreviousVoteOnPoll.id
           }
         })
       }
     }

     await prisma.vote.create({
       date: {
         sessionId,
         pollId,
         pollOptionId
       }
     })

     return reply.status(201).send()
   })
}
```

- Change the file `src/http/server.ts`:

```typescript
import cookie from '@fastify/cookie'
import { voteOnPoll} from "./routes/vote-on-poll";

app.register(cookie, {
   secret: 'my-cookie-secret-app-nlw',
   hook: 'onRequest'
});
app.register(voteOnPoll);
```
- Change the generated file `prisma/schema.prisma`:

```prism
model Poll {
   votes Vote[]
}

model PollOption {
   votes Vote[]
}

model Vote {
   id Int @id @default(autoincrement())
   sessionId String
   pollId String
   pollOptionId String
   createAt DateTime @default(now())

   pollOption PollOption @relation(fields: [pollOptionId], references: [id])
   poll Poll @relation(fields: [pollId], references: [id])

   @@unique([sessionId, pollId])
}
```

- In the terminal, type `npx prisma migrate dev` and then `create votes` to create migration;
- Test with Postman and Prisma Studio:

  * `POST /polls`:

![Image-03-Postman-CreatePoll](imgs/Image-03-Postman-CreatePoll.jpg)

![Image-05-PrismaStudio-PollOption](imgs/Image-05-PrismaStudio-PollOption.jpg)

* `GET '/polls/:pollId`:

![Image-06-Postman-GetPoll](imgs/Image-06-Postman-GetPoll.jpg)

![Image-04-PrismaStudio-Poll](imgs/Image-04-PrismaStudio-Poll.jpg)

* `POST /polls/:pollId/votes`:

![Image-07-Postman-VotePoll-1](imgs/Image-07-Postman-VotePoll-1.jpg)

![Image-08-Postman-VotePoll-2](imgs/Image-08-Postman-VotePoll-2.jpg)

![Image-09-PrismaStudio-Vote](imgs/Image-09-PrismaStudio-Vote.jpg)


## References
Docker Hub - bitnami - Postgresql:
https://hub.docker.com/r/bitnami/postgresql

Docker Hub - bitnami - Redis:
https://hub.docker.com/r/bitnami/redis

Prisma:
https://www.prisma.io/orm