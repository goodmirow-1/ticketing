export const IWaitingReaderRepositoryRedisToken = Symbol('IWaitingReaderRedisRepository')

export interface IWaitingReaderRedisRepository {
    getWaitingNumber(userId: string): Promise<number>
    getValidTokenByUserId(userId: string): Promise<string>
    isValidTokenCountUnderThreshold(): Promise<boolean>
    isWaitingQueueEmpty(): Promise<boolean>
}
