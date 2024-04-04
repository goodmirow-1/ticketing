import type { IConcertDate } from './concertDate.interface'
import type { IReservation } from './reservation.interface'

export interface ISeat {
    id: number

    seatNumber: number

    concertDate: IConcertDate

    status: string

    reservations: IReservation[]
}
