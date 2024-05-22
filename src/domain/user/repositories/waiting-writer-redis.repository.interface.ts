export const IWaitingWriterRepositoryRedisToken = Symbol('IWaitingWriterRedisRepository')

export interface IWaitingWriterRedisRepository {
    enqueueWaitingUser(userId: string)
    dequeueWaitingUser(): Promise<string>
    dequeueWaitingUserIdList(dequeueCount: number): Promise<string[]>

    createValidToken(userId: string)
    createValidTokenList(userIdList: string[])

    setExpireToken(userId: string): Promise<boolean>
}
