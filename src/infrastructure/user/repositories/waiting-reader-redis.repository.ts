import { Injectable } from '@nestjs/common'
import type { IWaitingReaderRedisRepository } from 'src/domain/user/repositories/waiting-reader-redis.repository.interface'
import { RedisService } from 'src/infrastructure/db/redis/redis-service'

@Injectable()
export class WaitingReaderRepositoryRedis implements IWaitingReaderRedisRepository {
    constructor(private redisService: RedisService) {}

    async getWaitingNumber(userId: string): Promise<number> {
        const position = await this.redisService.lrange('waitingQueue', 0, -1)
        const index = position.indexOf(userId)
        return index == -1 ? -1 : index + 1
    }

    async getValidTokenByUserId(userId: string): Promise<string> {
        const token = await this.redisService.get(`token:${userId}`)
        return token
    }

    async acquireLock(lockKey: string, lockValue: string, ttl: number): Promise<boolean> {
        return await this.redisService.acquireLock(lockKey, lockValue, ttl)
    }

    async releaseLock(lockKey: string, lockValue: string): Promise<void> {
        return await this.redisService.releaseLock(lockKey, lockValue)
    }

    async validateUser(userId: string) {
        return await this.redisService.validateUser(userId)
    }
}
