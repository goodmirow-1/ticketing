import { Inject, Injectable } from '@nestjs/common'
import type { IConcertWriterRepository } from 'src/domain/concert/repositories/concert-writer.repository.interface'
import { EntityManager } from 'typeorm'
import { Concert } from '../models/concert.entity'
import { ConcertDate } from '../models/concertDate.entity'
import { Seat } from '../models/seat.entity'
import { Reservation } from '../models/reservation.entity'
import { FailedUpdateSeatStatusError } from 'src/domain/concert/exceptions/failed-update-seat-status.exception'
import { FailedCreateReservationError } from 'src/domain/concert/exceptions/failed-create-reservation.exception'

@Injectable()
export class ConcertWriterRepositoryTypeORM implements IConcertWriterRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

    async createConcert(singerName: string): Promise<Concert> {
        return await this.entityManager.save(Concert, { singerName })
    }

    async createConcertDate(concert: Concert, date: Date): Promise<ConcertDate> {
        return this.entityManager.save(ConcertDate, { concert, date })
    }

    createSeat(concertDate: ConcertDate, seatNumber: number): Promise<Seat> {
        return this.entityManager.save(Seat, { concertDate, seatNumber })
    }

    private async updateSeatStatus(concertDateId: string, status: string): Promise<boolean> {
        return await this.entityManager
            .createQueryBuilder()
            .update(Seat)
            .set({ status })
            .where('id = :concertDateId', { concertDateId }) // Add a comma after the placeholder
            .execute()
            .then(result => result.affected > 0)
    }

    async createReservation(seat: Seat, userId: string): Promise<Reservation> {
        const reservation = await this.entityManager.save(Reservation, {
            userId,
            seat,
            concert: seat.concertDate.concert,
            concertDate: seat.concertDate,
            holdExpiresAt: new Date(Date.now() + 1000 * 60 * 5), //5분
        })

        if (!reservation) {
            throw new FailedCreateReservationError('Failed to create reservation')
        }

        const result = await this.updateSeatStatus(seat.concertDate.id, 'reserved')

        if (result === false) {
            //rollback
            await this.entityManager.delete(Reservation, reservation.id)

            throw new FailedUpdateSeatStatusError('Failed to update seat status')
        }

        return reservation
    }
}
