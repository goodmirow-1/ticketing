import type { IWaitingUser } from '../../waiting/models/waiting-user.entity.interface'

export const IWaitingReaderRepositoryToken = Symbol('IWaitingReaderRepository')
export interface IWaitingReaderRepository {
    findWaitingUserPosition(userId: string): Promise<number>
    getTokenStatus(userId: string, token: string)
    findLastWaitingUser(): Promise<IWaitingUser[]>

    findValidTokenByUserId(userId: string): Promise<string>
    isValidTokenCountUnderThreshold(queryRunner?: any, lockOption?: any): Promise<boolean>
}
