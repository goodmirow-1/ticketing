import { Inject, Injectable } from '@nestjs/common'
import type { IConcertWriterRepository } from 'src/domain/concert/business/repositories/concert-writer.repository.interface'
import { EntityManager } from 'typeorm'
import { Concert } from '../models/concert.entity'
import { ConcertDate } from '../models/concertDate.entity'
import { Seat } from '../models/seat.entity'
import type { Reservation } from '../models/reservation.entity'
import { DuplicateConcertDateError } from 'src/domain/concert/business/exceptions/duplicate-concert-date.exception'

@Injectable()
export class ConcertWriterRepository implements IConcertWriterRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

    async createConcert(singerName: string): Promise<Concert> {
        return await this.entityManager.save(Concert, { singerName })
    }

    async createConcertDate(concert: Concert, date: Date): Promise<ConcertDate> {
        const existingConcertDate = await this.entityManager.findOne(ConcertDate, { where: { date } })

        if (existingConcertDate) {
            throw new DuplicateConcertDateError(`Concert date ${date} already exists`)
        }

        return this.entityManager.save(ConcertDate, { concert, date })
    }

    createSeat(concertDateId: string, seatNumber: number): Promise<Seat> {
        return this.entityManager.save(Seat, { concertDateId, seatNumber })
    }

    updateSeatStatus(concertDateId: string, isStatus: boolean): Promise<boolean> {
        return this.entityManager
            .createQueryBuilder()
            .update(Seat)
            .set({ isStatus })
            .where('concertDateId = :concertDateId', { concertDateId })
            .execute()
            .then(result => result.affected > 0)
    }

    createReservation(concertDateId: string, seatId: string, userId: string): Promise<Reservation> {
        return Promise.resolve({} as Reservation)
    }
}
