import type { IReservation } from 'src/domain/concert/models/reservation.entity.interface'
import type { IUser } from './user.entity.interface'

export class IPointHistory {
    id: number

    user: IUser

    reservation: IReservation

    amount: number

    reason: 'charge' | 'payment'

    paymentDate: Date
}
