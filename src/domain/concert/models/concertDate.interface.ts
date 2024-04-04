import type { IConcert } from './concert.interface'
import type { ISeat } from './seat.interface'

export interface IConcertDate {
    id: number

    date: string

    availableSeats: number

    concert: IConcert

    seats: ISeat[]
}
