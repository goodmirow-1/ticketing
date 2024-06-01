import { Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import Redlock from 'redlock'

export const RedisServiceToken = Symbol('RedisService')

@Injectable()
export class RedisService {
    private redisClient: Redis
    private readonly redlock: Redlock
    private readonly lockDuration = 5_000

    constructor() {
        const host = process.env.REDIS_HOST
        const port = parseInt(process.env.REDIS_PORT, 10)

        this.redisClient = new Redis({
            host: host,
            port: port,
        })

        this.redlock = new Redlock([this.redisClient])
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

    async rpop(key: string) {
        return await this.redisClient.rpop(key)
    }

    async eval(script: string, numkeys: number, ...keysAndArgs: (string | number)[]): Promise<any> {
        return await this.redisClient.eval(script, numkeys, ...keysAndArgs)
    }

    async acquireLock(key: string) {
        return await this.redlock.acquire([`lock:${key}`], this.lockDuration)
    }

    async releaseLock(lock: any) {
        return await lock.release()
    }

    async validateUser(userId: string) {
        return await this.redisClient.get(`token:${userId}`)
    }

    async clearAllData(): Promise<void> {
        await this.redisClient.flushall()
    }
}
