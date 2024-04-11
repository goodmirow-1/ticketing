import type { IConcert } from '../models/concert.entity.interface'
import type { IConcertDate } from '../models/concertDate.entity.interface'
import type { IReservation } from '../models/reservation.entity.interface'
import type { ISeat } from '../models/seat.entity.interface'

export interface IConcertWriterRepository {
    createConcert(singerName: string): Promise<IConcert>
    createConcertDate(concert: IConcert, date: Date): Promise<IConcertDate>
    createSeat(concert: IConcertDate, seatNumber: number, price: number): Promise<ISeat>
    createReservation(seat: ISeat, userId: string): Promise<IReservation>

    updateConcertDateAvailableSeat(concertDateId: string, amount: number)
    doneReservationPaid(reservation: IReservation)
}
