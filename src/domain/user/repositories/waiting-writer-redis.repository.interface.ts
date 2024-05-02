export const IWaitingWriterRepositoryRedisToken = Symbol('IWaitingWriterRedisRepository')

export interface IWaitingWriterRedisRepository {
    enqueueWaitingUser(userId: string, position: number)
    dequeueWaitingUser(): Promise<string>

    createValidToken(userId: string)
    createValidTokenOrWaitingUser(userId: string, isValid: boolean, position: number)

    setExpireToken(userId: string): Promise<boolean>
}
