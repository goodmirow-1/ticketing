import type { IConcertDate } from './concertDate.entity.interface'

export interface IConcert {
    id: string

    singerName: string

    concertDates: IConcertDate[]
}
