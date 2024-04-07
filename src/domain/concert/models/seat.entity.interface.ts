import type { IConcertDate } from './concertDate.entity.interface'
import type { IReservation } from './reservation.entity.interface'

export interface ISeat {
    id: string

    seatNumber: number

    concertDate: IConcertDate

    status: string

    reservations: IReservation[]
}
