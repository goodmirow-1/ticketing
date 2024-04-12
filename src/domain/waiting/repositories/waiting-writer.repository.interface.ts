export const IWaitingWriterRepositoryToken = Symbol('IWaitingWriterRepository')
export interface IWaitingWriterRepository {
    deleteWaitingUser(id: string): Promise<boolean>

    createValidToken(userId: string, position?: number): Promise<string>
    createWaitingToken(userId: string): Promise<string>
    createValidTokenOrWaitingUser(userId: string, isValid: boolean): Promise<string>

    expiredValidToken(token?: string)
}
