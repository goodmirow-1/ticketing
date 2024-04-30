import type { IWaitingReaderRepository } from 'src/domain/waiting/repositories/waiting-reader.repository.interface'
import type { IWaitingWriterRepository } from 'src/domain/waiting/repositories/waiting-writer.repository.interface'

export function initWaitingReaderMockRepo(): Record<keyof IWaitingReaderRepository, jest.Mock> {
    return {
        findWaitingUserPosition: jest.fn(),
        getTokenStatus: jest.fn(),
        findLastWaitingUser: jest.fn(),
        findValidTokenByUserId: jest.fn(),
        isValidTokenCountUnderThreshold: jest.fn(),
    }
}

export function initWaitingWriterMockRepo(): Record<keyof IWaitingWriterRepository, jest.Mock> {
    return {
        deleteWaitingUser: jest.fn(),
        createWaitingToken: jest.fn(),
        createValidTokenOrWaitingUser: jest.fn(),
        expiredValidToken: jest.fn(),
    }
}
