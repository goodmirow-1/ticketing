import type { IReservation } from 'src/domain/concert/models/reservation.interface'
import type { IUser } from './user.interface'

export class IPointLog {
    id: number

    user: IUser

    reservation: IReservation

    amount: number

    reason: 'charge' | 'payment'

    paymentDate: Date
}
