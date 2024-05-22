export const IWaitingReaderRepositoryRedisToken = Symbol('IWaitingReaderRedisRepository')

export interface IWaitingReaderRedisRepository {
    getWaitingNumber(userId: string): Promise<number>
    getValidTokenByUserId(userId: string): Promise<string>

    acquireLock(lockKey: string, lockValue: string, ttl: number): Promise<boolean>
    releaseLock(lockKey: string, lockValue: string): Promise<void>

    validateUser(userId: string)
}
