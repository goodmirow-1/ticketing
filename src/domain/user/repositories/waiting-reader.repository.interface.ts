export const IWaitingReaderRepositoryToken = Symbol('IWaitingReaderRepository')

export interface IWaitingReaderRepository {
    getWaitingNumber(userId: string, waitingCount: number): Promise<number>
    getValidTokenByUserId(userId: string): Promise<string>

    acquireLock(key: string)
    releaseLock(lock: any)

    validateUser(userId: string)
}
