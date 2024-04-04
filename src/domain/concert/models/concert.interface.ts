import type { IConcertDate } from './concertDate.interface'

export interface IConcert {
    id: number

    singerName: string

    concertDates: IConcertDate[]
}
