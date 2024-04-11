import type { IReservation } from 'src/domain/concert/models/reservation.entity.interface'
import type { IPointHistory } from '../models/point-history.entity.interface'
import type { IUser } from '../models/user.entity.interface'

export interface IUserWriterRepository {
    createUser(name: string): Promise<IUser>
    calculatePoint(user: IUser, point: number, reason: string, reservation?: IReservation): Promise<IPointHistory>
    checkValidPoint(point: number): void
}
