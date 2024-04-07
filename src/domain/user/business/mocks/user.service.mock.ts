import type { IUserReaderRepository } from '../repositories/user-reader.repository.interface'
import type { IUserWriterRepository } from '../repositories/user-writer.repository.interface'

export function initUserReaderMockRepo(): Record<keyof IUserReaderRepository, jest.Mock> {
    return {
        findUserById: jest.fn(),
        findUserPointById: jest.fn(),
        findWaitingUserById: jest.fn(),
        getWaitingUserCount: jest.fn(),
        findLastWaitingUser: jest.fn(),
        findValidToken: jest.fn(),
        isTokenCountUnderThreshold: jest.fn(),
        findPointHistoryByUserId: jest.fn(),
    }
}

export function initUserWriterMockRepo(): Record<keyof IUserWriterRepository, jest.Mock> {
    return {
        createUser: jest.fn(),
        updateUserPoint: jest.fn(),
        createWaitingUser: jest.fn(),
        deleteWaitingUser: jest.fn(),
        createValidTokenOrWaitingUser: jest.fn(),
        deleteValidToken: jest.fn(),
        createPointHistory: jest.fn(),
    }
}

export function setValidToken(mockReaderRepo: ReturnType<typeof initUserReaderMockRepo>, mockWriterRepo: ReturnType<typeof initUserWriterMockRepo>) {
    mockReaderRepo.isTokenCountUnderThreshold.mockResolvedValue(true)
    mockReaderRepo.getWaitingUserCount.mockResolvedValue(0)
    mockWriterRepo.createValidTokenOrWaitingUser.mockResolvedValue('token')
}

export function setWaitingUserToken(mockReaderRepo: ReturnType<typeof initUserReaderMockRepo>, mockWriterRepo: ReturnType<typeof initUserWriterMockRepo>) {
    mockReaderRepo.isTokenCountUnderThreshold.mockResolvedValue(false)
    mockReaderRepo.getWaitingUserCount.mockResolvedValue(1)
    mockWriterRepo.createValidTokenOrWaitingUser.mockResolvedValue('token')
}
