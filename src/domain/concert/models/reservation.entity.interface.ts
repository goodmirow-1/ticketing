import type { IUser } from 'src/domain/user/models/user.entity.interface'
import type { ISeat } from './seat.entity.interface'
import type { IConcert } from './concert.entity.interface'
import type { IConcertDate } from './concertDate.entity.interface'

export interface IReservation {
    id: string

    user: IUser

    seat: ISeat

    concert: IConcert

    concertDate: IConcertDate

    holdExpiresAt: Date

    paymentCompleted: boolean
}
