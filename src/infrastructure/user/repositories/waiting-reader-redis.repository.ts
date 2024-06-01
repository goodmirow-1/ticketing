import { HttpStatus, Injectable } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'
import type { IWaitingReaderRepository } from 'src/domain/user/repositories/waiting-reader.repository.interface'
import { RedisService } from 'src/infrastructure/db/redis/redis-service'

@Injectable()
export class WaitingReaderRepository implements IWaitingReaderRepository {
    constructor(private redisService: RedisService) {}

    async getWaitingNumber(userId: string, waitingCount: number): Promise<number> {
        const position = await this.redisService.lrange('waitingQueue', 0, waitingCount)
        const index = position.indexOf(userId)
        return index == -1 ? -1 : position.length - index
    }

    async getValidTokenByUserId(userId: string): Promise<string> {
        const token = await this.redisService.get(`token:${userId}`)
        return token
    }

    async acquireLock(key: string) {
        return await this.redisService.acquireLock(key)
    }

    async releaseLock(lock: any) {
        return await this.redisService.releaseLock(lock)
    }

    async validateUser(userId: string) {
        const isValidate = await this.redisService.get(`token:${userId}`)

        if (!isValidate) {
            throw new CustomException('Forbidden resource', HttpStatus.FORBIDDEN)
        }
    }
}
