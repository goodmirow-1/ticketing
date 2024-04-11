import type { IConcert } from '../models/concert.entity.interface'
import type { IConcertDate } from '../models/concertDate.entity.interface'
import type { IReservation } from '../models/reservation.entity.interface'
import type { ISeat } from '../models/seat.entity.interface'

export interface IConcertReaderRepository {
    findConcertById(id: string): Promise<IConcert>
    findAllConcerts(): Promise<IConcert[]>

    checkValidConcertDateByDate(date: Date)
    findConcertDateById(concertDateId: string): Promise<IConcertDate>

    checkValidSeatNumber(seatNumber: number)
    findSeatById(seatId: string): Promise<ISeat>
    findSeatsByConcertDateId(concertDateId: string): Promise<ISeat[]>

    findReservationById(reservationId: string): Promise<IReservation>
}
