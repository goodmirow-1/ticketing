import { v4 as uuidv4 } from 'uuid'
import type { IReservation } from '../../../domain/concert/models/reservation.entity.interface'
import type { ICreateReservationCompleteEvent } from 'src/domain/concert/event/create-reservation-complete.event.interface'

export class CreateReservationCompleteEvent implements ICreateReservationCompleteEvent {
    public readonly eventId: string
    public readonly publishing: number
    public readonly reservation: IReservation
    public readonly session: any

    constructor(reservation: IReservation, session: any) {
        this.eventId = uuidv4()
        this.publishing = new Date().getTime()
        this.reservation = reservation
        this.session = session
    }
}
