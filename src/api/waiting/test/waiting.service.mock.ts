import type { IWaitingReaderRepository } from 'src/domain/waiting/repositories/waiting-reader.repository.interface'
import type { IWaitingWriterRepository } from 'src/domain/waiting/repositories/waiting-writer.repository.interface'

export function initWaitingReaderMockRepo(): Record<keyof IWaitingReaderRepository, jest.Mock> {
    return {
        findWaitingUserById: jest.fn(),
        getWaitingUserCount: jest.fn(),
        findLastWaitingUser: jest.fn(),
        findValidToken: jest.fn(),
        isTokenCountUnderThreshold: jest.fn(),
    }
}

export function initWaitingWriterMockRepo(): Record<keyof IWaitingWriterRepository, jest.Mock> {
    return {
        createWaitingUser: jest.fn(),
        deleteWaitingUser: jest.fn(),
        createValidTokenOrWaitingUser: jest.fn(),
        deleteValidToken: jest.fn(),
    }
}
