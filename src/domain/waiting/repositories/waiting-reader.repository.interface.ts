import type { IWaitingUser } from '../../waiting/models/waiting-user.entity.interface'

export const IWaitingReaderRepositoryToken = Symbol('IWaitingReaderRepository')
export interface IWaitingReaderRepository {
    isSameWaitingNumber(positionNumber: number, waitingNumber: number): boolean

    findWaitingUserPosition(userId: string): Promise<number>
    getWaitingUserCount(isValid: boolean): Promise<number>
    getTokenStatus(userId: string, token: string)
    findLastWaitingUser(): Promise<IWaitingUser[]>

    findValidTokenByUserId(userId: string): Promise<string>
    isValidTokenCountUnderThreshold(queryRunner?: any, lockOption?: any): Promise<boolean>
}
