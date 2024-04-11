type Session = any

export const DataAccessorToken = Symbol('DataAccessor')
export interface DataAccessor {
    getSession(option?: any): Promise<Session>
    commitTransaction(session: Session): Promise<void>
    rollbackTransaction(session: Session): Promise<void>
    releaseQueryRunner(session: Session): Promise<void>
}

export function initDataAccesorMock(): Record<keyof DataAccessor, jest.Mock> {
    return {
        getSession: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        releaseQueryRunner: jest.fn(),
    }
}
