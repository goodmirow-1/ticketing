import { Injectable } from '@nestjs/common'
import { generateAccessToken } from '../../../domain/common/jwt-token.util'
import type { IWaitingWriterRepository } from 'src/domain/user/repositories/waiting-writer.repository.interface'
import { RedisService } from 'src/infrastructure/db/redis/redis-service'

@Injectable()
export class WaitingWriterRepository implements IWaitingWriterRepository {
    constructor(private redisService: RedisService) {}

    // Implementation of IWaitingWriterRepository methods
    async enqueueWaitingUser(userId: string) {
        const length = await this.redisService.lpush('waitingQueue', userId)
        return { token: null, waitingNumber: length }
    }

    async dequeueWaitingUser(): Promise<string> {
        return await this.redisService.rpop('waitingQueue')
    }

    async dequeueWaitingUserIdList(dequeueCount: number): Promise<string[]> {
        const dequeueScript = `
          local queue_key = KEYS[1]
          local dequeue_count = tonumber(ARGV[1])

          local user_ids = {}

          for i = 1, dequeue_count do
              local user_id = redis.call("RPOP", queue_key)
              if not user_id then
                  break
              end
              table.insert(user_ids, user_id)
          end

          return user_ids
        `

        return (await this.redisService.eval(
            dequeueScript,
            1,
            'waitingQueue', // The key for the waiting queue
            dequeueCount.toString(),
        )) as unknown as string[]
    }

    async createValidToken(userId: string) {
        const expirationTime = parseInt(process.env.VALID_TOKEN_EXPIRATION_TIME, 10)
        const expiration = Math.floor(Date.now() / 1000) + expirationTime
        const accessToken = generateAccessToken(userId, expiration, 0)

        // Set the token with an expiration time in Redis
        await this.redisService.set(`token:${userId}`, accessToken, expirationTime)

        return { token: accessToken, waitingNumber: 0 }
    }

    async createValidTokenList(userIdList: string[]) {
        const tokenKeyPrefix = 'token:'
        const tokenDataList = []

        const expirationTime = parseInt(process.env.VALID_TOKEN_EXPIRATION_TIME, 10)
        for (let i = 0; i < userIdList.length; ++i) {
            const userId = userIdList[i]
            const expiration = Math.floor(Date.now() / 1000) + i + expirationTime
            const token = generateAccessToken(userId, expiration, 0)

            tokenDataList.push({
                userId,
                token,
                expirationTime,
            })
        }

        const createTokensScript = `
            local token_key_prefix = ARGV[1]
            local token_data_list = cjson.decode(ARGV[2])

            for _, token_data in ipairs(token_data_list) do
                local token_key = token_key_prefix .. token_data.userId
                redis.call("SET", token_key, token_data.token, "EX", token_data.expirationTime)
            end

            return #token_data_list
        `

        return await this.redisService.eval(createTokensScript, 0, tokenKeyPrefix, JSON.stringify(tokenDataList))
    }

    async setExpireToken(userId: string): Promise<boolean> {
        // Use the DEL command to remove the token from Redis
        const result = await this.redisService.del(`token:${userId}`)

        // The result will be 1 if the key was deleted, 0 if the key did not exist
        return result === 1
    }
}
