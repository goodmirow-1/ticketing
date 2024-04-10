import type { IWaitingUser } from '../../waiting/models/waiting-user.entity.interface'

export interface IWaitingReaderRepository {
    findWaitingUserPosition(userId: string): Promise<number>
    getWaitingUserCount(isValid: boolean): Promise<number>
    findLastWaitingUser(): Promise<IWaitingUser>

    findValidToken(token: string): Promise<boolean>
    isTokenCountUnderThreshold(): Promise<boolean>
}
