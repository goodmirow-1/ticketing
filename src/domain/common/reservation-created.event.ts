import { v4 as uuidv4 } from 'uuid'
import type { IReservation } from '../concert/models/reservation.entity.interface'

export class ReservationCreatedEvent {
    public readonly eventId: string
    public readonly publishing: number
    public readonly reservation: IReservation

    constructor(reservation: IReservation) {
        this.eventId = uuidv4()
        this.publishing = new Date().getTime()
        this.reservation = reservation
    }
}
