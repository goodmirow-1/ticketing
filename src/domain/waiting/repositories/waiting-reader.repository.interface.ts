import type { IWaitingUser } from '../../waiting/models/waiting-user.entity.interface'

export interface IWaitingReaderRepository {
    isSameWaitingNumber(positionNumber: number, waitingNumber: number): boolean

    findWaitingUserPosition(userId: string): Promise<number>
    getWaitingUserCount(isValid: boolean): Promise<number>
    findLastWaitingUser(): Promise<IWaitingUser[]>

    findValidToken(token: string): Promise<boolean>
    isTokenCountUnderThreshold(): Promise<boolean>
}
