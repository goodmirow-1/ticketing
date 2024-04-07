import type { IPointHistory } from '../../models/point-history.entity.interface'
import type { IUser } from '../../models/user.entity.interface'

export interface IUserReaderRepository {
    findUserById(id: string): Promise<IUser>
    findUserPointById(id: string): Promise<number>

    findWaitingUserById(token: string): Promise<number>
    getWaitingUserCount(isValid: boolean): Promise<number>
    findLastWaitingUser(): Promise<IUser>

    findValidToken(token: string): Promise<boolean>
    isTokenCountUnderThreshold(): Promise<boolean>

    findPointHistoryByUserId(userId: string): Promise<IPointHistory>
}
