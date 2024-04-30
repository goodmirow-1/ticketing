export const IWaitingWriterRepositoryToken = Symbol('IWaitingWriterRepository')
export interface IWaitingWriterRepository {
    deleteWaitingUser(id: string): Promise<boolean>

    createWaitingToken(userId: string, querryRunner?: any, lockOption?: any, position?: number)
    createValidTokenOrWaitingUser(userId: string, isValid: boolean, querryRunner?: any, lockOption?: any)

    expiredValidToken(token?: string, querryRunner?: any)
}
