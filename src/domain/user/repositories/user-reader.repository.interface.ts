import type { IPointHistory } from '../models/point-history.entity.interface'
import type { IUser } from '../models/user.entity.interface'

export interface IUserReaderRepository {
    findUserById(id: string): Promise<IUser>
    findUserPointById(id: string): Promise<number>

    findPointHistoryByUserId(userId: string): Promise<IPointHistory>
}
