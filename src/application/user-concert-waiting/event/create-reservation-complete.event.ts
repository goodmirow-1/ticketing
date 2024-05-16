import { v4 as uuidv4 } from 'uuid'
import type { Reservation } from 'src/infrastructure/concert/models/reservation.entity'

export class CreateReservationCompleteEvent {
    public readonly eventId: string
    public readonly publishing: number
    public readonly reservation: Reservation
    public readonly session: any

    constructor(reservation: Reservation, session: any) {
        this.eventId = uuidv4()
        this.publishing = new Date().getTime()
        this.reservation = reservation
        this.session = session
    }
}
