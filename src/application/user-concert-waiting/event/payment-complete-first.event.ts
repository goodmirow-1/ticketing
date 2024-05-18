import type { IReservation } from 'src/domain/concert/models/reservation.entity.interface'
import type { IUser } from 'src/domain/user/models/user.entity.interface'
import { v4 as uuidv4 } from 'uuid'

export class PaymentCompleteFirstEvent {
    public readonly eventId: string
    public readonly publishing: number
    public readonly user: IUser
    public readonly reservation: IReservation

    constructor(user: IUser, reservation: IReservation) {
        this.eventId = uuidv4()
        this.publishing = new Date().getTime()
        this.user = user
        this.reservation = reservation
    }
}
