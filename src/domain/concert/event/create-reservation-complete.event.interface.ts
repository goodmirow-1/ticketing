import type { IReservation } from '../../../domain/concert/models/reservation.entity.interface'

export interface ICreateReservationCompleteEvent {
    eventId: string

    publishing: number

    reservation: IReservation

    session: any
}
