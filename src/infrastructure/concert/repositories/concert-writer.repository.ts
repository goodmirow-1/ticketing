import type { OnModuleInit } from '@nestjs/common'
import { Inject, Injectable } from '@nestjs/common'
import type { IConcertWriterRepository } from 'src/domain/concert/repositories/concert-writer.repository.interface'
import { EntityManager } from 'typeorm'
import { Concert } from '../models/concert.entity'
import { ConcertDate } from '../models/concertDate.entity'
import { Seat } from '../models/seat.entity'
import { Reservation } from '../models/reservation.entity'
import { FailedUpdateSeatStatusError } from 'src/domain/concert/exceptions/failed-update-seat-status.exception'
import { FailedCreateReservationError } from 'src/domain/concert/exceptions/failed-create-reservation.exception'
import { SchedulerRegistry } from '@nestjs/schedule'
import { FailedUpdateReservationError } from 'src/domain/concert/exceptions/faild-update-reservation.exception'

@Injectable()
export class ConcertWriterRepositoryTypeORM implements IConcertWriterRepository, OnModuleInit {
    constructor(
        @Inject(EntityManager) private readonly entityManager: EntityManager,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.entityManager.query('TRUNCATE TABLE valid_token')
        await this.entityManager.query('TRUNCATE TABLE waiting_user')
    }

    async createConcert(singerName: string): Promise<Concert> {
        return await this.entityManager.save(Concert, { singerName })
    }

    async createConcertDate(concert: Concert, date: Date): Promise<ConcertDate> {
        return this.entityManager.save(ConcertDate, { concert, date })
    }

    createSeat(concertDate: ConcertDate, seatNumber: number, price: number): Promise<Seat> {
        return this.entityManager.save(Seat, { concertDate, seatNumber, price })
    }

    async createReservation(seat: Seat, userId: string): Promise<Reservation> {
        const reservation = await this.entityManager.save(Reservation, {
            user: { id: userId },
            seat,
            concert: seat.concertDate.concert,
            concertDate: seat.concertDate,
            holdExpiresAt: new Date(Date.now() + 1000 * 60 * 5), //5분
        })

        if (!reservation) {
            throw new FailedCreateReservationError('Failed to create reservation')
        }

        const result = await this.updateSeatStatus(seat.id, 'reserved')

        if (result === false) {
            //rollback
            await this.entityManager.delete(Reservation, reservation.id)

            throw new FailedUpdateSeatStatusError('Failed to update seat status')
        }

        // 예약 만료 시간 설정
        {
            const expirationTime = parseInt(process.env.SEAT_HOLD_EXPIRATION_TIME, 10)

            const timeout = setTimeout(async () => {
                //예약했으면
                if (reservation.paymentCompleted) return

                await this.entityManager.delete(Reservation, reservation.id)
                await this.updateSeatStatus(seat.id, 'available')
                await this.updateConcertDateAvailableSeat(seat.concertDate.id, 1)
            }, expirationTime * 1000)

            this.schedulerRegistry.addTimeout(reservation.id, timeout)
        }

        reservation.seat.status = 'reserved'

        return reservation
    }

    async doneReservationPaid(reservation: Reservation) {
        const paymentUpdateResult = await this.entityManager
            .createQueryBuilder()
            .update(Reservation)
            .set({ paymentCompleted: true })
            .where('id = :id', { id: reservation.id })
            .execute()

        if (paymentUpdateResult.affected === 0) {
            throw new FailedUpdateReservationError('Failed to update reservation payment status.')
        }

        const result = await this.updateSeatStatus(reservation.seat.id, 'held')

        if (result === false) {
            throw new FailedUpdateSeatStatusError('Failed to update seat status')
        }

        const reservationScheduler = this.schedulerRegistry.doesExist('timeout', reservation.id)
        if (reservationScheduler) {
            clearTimeout(this.schedulerRegistry.getTimeout(reservation.id))
        }
    }

    private async updateSeatStatus(id: string, status: string): Promise<boolean> {
        return await this.entityManager
            .createQueryBuilder()
            .update(Seat)
            .set({ status })
            .where('id = :id', { id }) // Add a comma after the placeholder
            .execute()
            .then(result => result.affected > 0)
    }

    async updateConcertDateAvailableSeat(concertDateId: string, amount: number) {
        await this.entityManager
            .createQueryBuilder()
            .update(ConcertDate)
            .set({ availableSeats: () => `availableSeats + ${amount}` })
            .where('id = :id', { id: concertDateId })
            .execute()
    }
}
