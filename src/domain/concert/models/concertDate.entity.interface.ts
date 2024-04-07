import type { IConcert } from './concert.entity.interface'
import type { ISeat } from './seat.entity.interface'

export interface IConcertDate {
    id: string

    date: Date

    availableSeats: number

    concert: IConcert

    seats: ISeat[]
}
