import type { IPointHistory } from '../models/point-history.entity.interface'
import type { IUser } from '../models/user.entity.interface'

export interface IUserWriterRepository {
    createUser(name: string): Promise<IUser>
    calculatePoint(user: IUser, point: number, reason: string): Promise<IPointHistory>
    checkValidPoint(point: number): void
}
