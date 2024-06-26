import type { IPointHistory } from '../models/point-history.entity.interface'
import type { IUser } from '../models/user.entity.interface'

export const IUserWriterRepositoryToken = Symbol.for('IUserWriterRepository')

export interface IUserWriterRepository {
    createUser(name: string): Promise<IUser>
    calculatePoint(user: IUser, point: number, reason: string, querryRunner?: any)

    createPointHistory(user: IUser, amount: number, reservationId?: string, querryRunner?: any): Promise<IPointHistory>
}
