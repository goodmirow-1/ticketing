import type { IConcert } from '../../models/concert.entity.interface'
import type { IConcertDate } from '../../models/concertDate.entity.interface'
import type { IReservation } from '../../models/reservation.entity.interface'
import type { ISeat } from '../../models/seat.entity.interface'

export interface IConcertWriterRepository {
    createConcert(singerName: string): Promise<IConcert>
    createConcertDate(concert: IConcert, date: Date): Promise<IConcertDate>

    createSeat(concertDateId: string, seatNumber: number): Promise<ISeat>
    updateSeatStatus(concertDateId: string, isStatus: boolean): Promise<boolean>

    createReservation(concertDateId: string, seatId: string, userId: string): Promise<IReservation>
}
