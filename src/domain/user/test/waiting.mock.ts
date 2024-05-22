import type { IWaitingReaderRedisRepository } from '../repositories/waiting-reader-redis.repository.interface'
import type { IWaitingWriterRedisRepository } from '../repositories/waiting-writer-redis.repository.interface'

export function initWaitingReaderRedisMockRepo(): Record<keyof IWaitingReaderRedisRepository, jest.Mock> {
    return {
        getWaitingNumber: jest.fn(),
        getValidTokenByUserId: jest.fn(),
        acquireLock: jest.fn(),
        releaseLock: jest.fn(),
        validateUser: jest.fn(),
    }
}

export function initWaitingWriterRedisMockRepo(): Record<keyof IWaitingWriterRedisRepository, jest.Mock> {
    return {
        enqueueWaitingUser: jest.fn(),
        dequeueWaitingUser: jest.fn(),
        dequeueWaitingUserIdList: jest.fn(),
        createValidToken: jest.fn(),
        createValidTokenList: jest.fn(),
        setExpireToken: jest.fn(),
    }
}
