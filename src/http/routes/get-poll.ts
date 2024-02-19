import { z } from "zod";
import { prisma } from '../../lib/prisma'
import { FastifyInstance} from "fastify";
import {redis} from "../../lib/redis";

export async function getPoll(app: FastifyInstance){
    app.get('/polls/:pollId', async(request, reply) =>{
        const getPollParams = z.object({
            pollId: z.string().uuid()
        })
        const { pollId } = getPollParams.parse(request.params);
        const poll = await prisma.poll.findUnique({
           where: {
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

        if(!poll) {
            return reply.status(400).send({
                message: 'Poll not found.'
            })
        }

        const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES')


        if(result){
            const votes: { [key: string]: string } = {};

            for (let i = 0; i < result.length; i += 2) {
                const key = result[i] as string;
                const value = result[i + 1] as string;
                votes[key] = value;
            }

            console.log(votes)

            return reply.send({
                poll: {
                    id: poll.id,
                    title: poll.title,
                    options: poll.options.map(option =>{
                        return {
                            id: option.id,
                            title: option.title,
                            score: (option.id in votes) ? votes[option.id] : 0
                        }
                    })
                }
            });
        }

        return reply.status(500).send({
            message: 'Other Errors.'
        })
    });
}