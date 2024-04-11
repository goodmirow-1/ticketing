import type { IConcertDate } from './concertDate.entity.interface'
import type { IReservation } from './reservation.entity.interface'

export interface ISeat {
    id: string

    seatNumber: number

    price: number

    concertDate: IConcertDate

    status: string

    reservation: IReservation
}
