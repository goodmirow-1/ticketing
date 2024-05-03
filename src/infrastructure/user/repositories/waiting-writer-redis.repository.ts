import { Injectable } from '@nestjs/common'
import { generateAccessToken } from '../../../domain/common/jwt-token.util'
import type { IWaitingWriterRedisRepository } from 'src/domain/user/repositories/waiting-writer-redis.repository.interface'
import { RedisService } from 'src/infrastructure/db/redis/redis-service'

@Injectable()
export class WaitingWriterRepositoryRedis implements IWaitingWriterRedisRepository {
    constructor(private redisService: RedisService) {
        this.subscribeToExpiredTokens()
    }

    private async subscribeToExpiredTokens() {
        // const subscribeClient = await this.redisService.getSubscribeClient()

        // await subscribeClient.subscribe('__keyevent@0__:expired', (error, count) => {
        //     if (error) {
        //         console.log(count)
        //         console.error('Failed to subscribe:', error)
        //         return
        //     }
        // })

        // subscribeClient.on('message', async (channel, message) => {
        //     if (message.startsWith('token:')) {
        //         const userId = await this.dequeueWaitingUser()
        //         if (userId) {
        //             await this.createValidToken(userId)
        //         }
        //     }
        // })
    }

    // Implementation of IWaitingWriterRepository methods
    async enqueueWaitingUser(userId: string, position: number) {
        if (position && position != 0) return { token: null, waitingNumber: position }

        await this.redisService.lpush('waitingQueue', userId)
        const length = await this.redisService.llen('waitingQueue')
        return { token: null, waitingNumber: length }
    }

    async dequeueWaitingUser(): Promise<string> {
        return (await this.redisService.getClient()).rpop('waitingQueue')
    }

    async createValidToken(userId: string) {
        const expirationTime = parseInt(process.env.VALID_TOKEN_EXPIRATION_TIME, 10)
        const expiration = Math.floor(Date.now() / 1000) + expirationTime
        const accessToken = generateAccessToken(userId, expiration, 0)

        // Set the token with an expiration time in Redis
        await this.redisService.set(`token:${userId}`, accessToken, expirationTime)

        return { token: accessToken, waitingNumber: 0 }
    }

    async createValidTokenOrWaitingUser(userId: string, isValid: boolean, position: number) {
        if (isValid) {
            return await this.createValidToken(userId)
        } else {
            return await this.enqueueWaitingUser(userId, position)
        }
    }

    async setExpireToken(userId: string): Promise<boolean> {
        // Use the DEL command to remove the token from Redis
        const result = await this.redisService.del(`token:${userId}`)

        // The result will be 1 if the key was deleted, 0 if the key did not exist
        return result === 1
    }
}
