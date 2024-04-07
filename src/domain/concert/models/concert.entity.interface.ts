import type { IConcertDate } from './concertDate.entity.interface'

export interface IConcert {
    id: number

    singerName: string

    concertDates: IConcertDate[]
}
