import { HttpStatus, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import Redlock from 'redlock'
import { CustomException } from 'src/custom-exception'

export const RedisServiceToken = Symbol('RedisService')

@Injectable()
export class RedisService {
    private redisClient: Redis
    private redisSubClient: Redis
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
        this.redisSubClient = new Redis({
            host: host,
            port: port,
        })

        this.redisSubClient.setMaxListeners(100) // 원하는 수로 증가시킵니다.
        this.redisSubClient.unsubscribe()
        this.redisSubClient.removeAllListeners('message')
    }

    async onModuleDestroy() {
        // 모든 구독 클라이언트의 리스너와 메시지 삭제
        await this.redisSubClient.unsubscribe()
        this.redisSubClient.removeAllListeners('message')
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
        const isValidate = await this.redisClient.get(`token:${userId}`)

        if (!isValidate) {
            throw new CustomException('Forbidden resource', HttpStatus.FORBIDDEN)
        }
    }

    async clearAllData(): Promise<void> {
        await this.redisClient.flushall()
    }
}
