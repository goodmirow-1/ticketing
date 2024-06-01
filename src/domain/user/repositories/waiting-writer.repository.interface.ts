export const IWaitingWriterRepositoryToken = Symbol('IWaitingWriterRepository')

export interface IWaitingWriterRepository {
    enqueueWaitingUser(userId: string)
    dequeueWaitingUser(): Promise<string>
    dequeueWaitingUserIdList(dequeueCount: number): Promise<string[]>

    createValidToken(userId: string)
    createValidTokenList(userIdList: string[])

    setExpireToken(userId: string): Promise<boolean>
}
