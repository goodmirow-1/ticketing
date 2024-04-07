import type { IConcert } from '../../models/concert.entity.interface'
import type { ISeat } from '../../models/seat.entity.interface'

export interface IConcertReaderRepository {
    findConcertById(id: string): Promise<IConcert>
    findAllConcertsByDate(): Promise<IConcert[]>

    findSeatsByConcertDate(concertDateId: string): Promise<ISeat[]>
}
