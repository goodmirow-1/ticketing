import type { IUserReaderRepository } from '../../../domain/user/repositories/user-reader.repository.interface'
import type { IUserWriterRepository } from '../../../domain/user/repositories/user-writer.repository.interface'

export function initUserReaderMockRepo(): Record<keyof IUserReaderRepository, jest.Mock> {
    return {
        findUserById: jest.fn(),
        findUserPointById: jest.fn(),
        checkValidPoint: jest.fn(),
    }
}

export function initUserWriterMockRepo(): Record<keyof IUserWriterRepository, jest.Mock> {
    return {
        createUser: jest.fn(),
        calculatePoint: jest.fn(),
    }
}
