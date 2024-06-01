import type { IWaitingReaderRepository } from '../repositories/waiting-reader.repository.interface'
import type { IWaitingWriterRepository } from '../repositories/waiting-writer.repository.interface'

export function initWaitingReaderRedisMockRepo(): Record<keyof IWaitingReaderRepository, jest.Mock> {
    return {
        getWaitingNumber: jest.fn(),
        getValidTokenByUserId: jest.fn(),
        acquireLock: jest.fn(),
        releaseLock: jest.fn(),
        validateUser: jest.fn(),
    }
}

export function initWaitingWriterRedisMockRepo(): Record<keyof IWaitingWriterRepository, jest.Mock> {
    return {
        enqueueWaitingUser: jest.fn(),
        dequeueWaitingUser: jest.fn(),
        dequeueWaitingUserIdList: jest.fn(),
        createValidToken: jest.fn(),
        createValidTokenList: jest.fn(),
        setExpireToken: jest.fn(),
    }
}
