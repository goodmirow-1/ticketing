import type { IUser } from 'src/domain/user/models/user.interface'
import type { ISeat } from './seat.interface'
import type { IConcert } from './concert.interface'
import type { IConcertDate } from './concertDate.interface'

export interface IReservation {
    id: number

    user: IUser

    seat: ISeat

    concert: IConcert

    concertDate: IConcertDate

    holdExpiresAt: Date

    paymentCompleted: boolean
}
