import type { IWaitingUser } from '../../waiting/models/waiting-user.entity.interface'

export const IWaitingReaderRepositoryToken = Symbol('IWaitingReaderRepository')
export interface IWaitingReaderRepository {
    isSameWaitingNumber(positionNumber: number, waitingNumber: number): boolean

    findWaitingUserPosition(userId: string): Promise<number>
    getWaitingUserCount(isValid: boolean): Promise<number>
    getTokenStatus(userId: string, isValid: boolean): Promise<number>
    findLastWaitingUser(): Promise<IWaitingUser[]>

    findValidTokenByUserId(userId: string): Promise<boolean>
    isTokenCountUnderThreshold(queryRunner?: any, lockOption?: any): Promise<boolean>
}
