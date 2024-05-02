import { Injectable } from '@nestjs/common'
import type { IWaitingReaderRedisRepository } from 'src/domain/user/repositories/waiting-reader-redis.repository.interface'
import { RedisService } from 'src/infrastructure/db/redis/redis-service'

@Injectable()
export class WaitingReaderRepositoryRedis implements IWaitingReaderRedisRepository {
    constructor(private redisService: RedisService) {}

    async getWaitingNumber(userId: string): Promise<number> {
        const position = await this.redisService.lrange('waitingQueue', 0, -1)
        const index = position.indexOf(userId)
        return index === -1 ? 0 : index + 1
    }

    async getValidTokenByUserId(userId: string): Promise<string> {
        const token = await this.redisService.get(`token:${userId}`)
        return token
    }

    async isValidTokenCountUnderThreshold(): Promise<boolean> {
        let cursor = '0'
        let count = 0

        const maxConnections = parseInt(process.env.MAX_CONNECTIONS, 10)

        do {
            const reply = await (await this.redisService.getClient()).scan(cursor, 'MATCH', 'token:*', 'COUNT', maxConnections)
            cursor = reply[0]
            count += reply[1].length
        } while (cursor !== '0')

        return count < maxConnections
    }

    async isWaitingQueueEmpty(): Promise<boolean> {
        const length = await this.redisService.llen('waitingQueue')
        return length == 0 ? true : false
    }
}
