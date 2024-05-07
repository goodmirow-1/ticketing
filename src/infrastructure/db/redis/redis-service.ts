import { HttpStatus, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { CustomException } from 'src/custom-exception'

export const RedisServiceToken = Symbol('RedisService')

@Injectable()
export class RedisService {
    private redisClient: Redis

    constructor() {
        const host = process.env.REDIS_HOST
        const port = parseInt(process.env.REDIS_PORT, 10)

        this.redisClient = new Redis({
            host: host,
            port: port,
        })

        //this.clearTokensAndQueue()
    }

    async clearTokensAndQueue() {
        // 모든 'token:*' 키를 삭제
        const keys = await this.redisClient.keys('token:*')
        if (keys.length) {
            await this.redisClient.del(...keys)
        }

        // 대기열 삭제
        await this.redisClient.del('waitingQueue')
    }

    async get(key: string) {
        return this.redisClient.get(key)
    }

    async getClient() {
        return this.redisClient
    }

    async set(key: string, value: string, ttl?: number): Promise<string> {
        if (ttl) {
            return this.redisClient.set(key, value, 'EX', ttl)
        } else {
            return this.redisClient.set(key, value)
        }
    }

    async del(key: string) {
        return await this.redisClient.del(key)
    }

    async lrange(key: string, start: string | number, stop: string | number) {
        return await this.redisClient.lrange(key, start, stop)
    }

    async lpush(key: string, value: string) {
        return await this.redisClient.lpush(key, value)
    }

    async llen(key: string) {
        return await this.redisClient.llen(key)
    }

    // Utility methods could be part of your RedisService or a separate LockService
    async acquireLock(lockKey: string, lockValue: string, ttl: number): Promise<boolean> {
        const result = await this.redisClient.set(lockKey, lockValue, 'PX', ttl, 'NX')
        return result === 'OK'
    }

    async releaseLock(lockKey: string, lockValue: string): Promise<void> {
        const script = `
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
        `
        await this.redisClient.eval(script, 1, lockKey, lockValue)
    }

    async validateUser(userId: string) {
        const isValidate = await this.redisClient.get(`token:${userId}`)

        if (!isValidate) {
            throw new CustomException('Forbidden resource', HttpStatus.FORBIDDEN)
        }
    }

    async clearAllData(): Promise<void> {
        await this.redisClient.flushall()
    }
}
