import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import type { ConnectionOptions } from 'tls'

@Injectable()
export class RedisService {
    private redisClient: Redis
    private subscriberClient: Redis

    constructor(private configService: ConfigService) {
        const host = process.env.REDIS_HOST
        const port = parseInt(process.env.REDIS_PORT, 10)
        const redisTls: ConnectionOptions | undefined = process.env.REDIS_TLS ? { servername: host } : undefined

        this.redisClient = new Redis({
            host: host,
            port: port,
            tls: redisTls,
        })
        this.subscriberClient = new Redis({
            host: host,
            port: port,
            tls: redisTls,
        })

        this.clearTokensAndQueue()
    }

    async clearTokensAndQueue() {
        // 모든 'token:*' 키를 삭제
        let cursor = '0'
        do {
            const scanResult = await this.redisClient.scan(cursor, 'MATCH', 'token:*', 'COUNT', 100)
            cursor = scanResult[0]
            const keys = scanResult[1]
            if (keys.length) {
                await this.redisClient.del(...keys)
            }
        } while (cursor !== '0')

        // 대기열 삭제
        await this.redisClient.del('waitingQueue')
    }

    async get(key: string) {
        return this.redisClient.get(key)
    }

    async getClient() {
        return this.redisClient
    }

    async getSubscribeClient() {
        return this.subscriberClient
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

    async subscribeToExpiredTokens(handler: () => void) {
        await this.subscriberClient.subscribe('__keyevent@0__:expired', (error, count) => {
            if (error) {
                console.log(count)
                console.error('Failed to subscribe:', error)
                return
            }
        })

        this.subscriberClient.on('message', (channel, message) => {
            if (message.startsWith('token:')) {
                handler()
            }
        })
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
}
