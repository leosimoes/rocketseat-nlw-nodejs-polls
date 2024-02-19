import { z } from "zod"
import { randomUUID} from "crypto";
import { prisma } from '../../lib/prisma'
import { FastifyInstance } from "fastify"
import { redis } from "../../lib/redis";

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
                maxAge: 60 * 60 * 24 * 30,
                signed: true,
                httpOnly: true
            })
        } else {
            const userPreviousVoteOnPoll = await prisma.vote.findUnique({
                where: {
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
                    where: {
                        id: userPreviousVoteOnPoll.id
                    }
                })

                await redis.zincrby(pollId, -1, userPreviousVoteOnPoll.pollOptionId)
            }
        }

        await prisma.vote.create({
            data: {
                sessionId,
                pollId,
                pollOptionId
            }
        })

        await redis.zincrby(pollId, 1, pollOptionId)

        return reply.status(201).send()
    })
}