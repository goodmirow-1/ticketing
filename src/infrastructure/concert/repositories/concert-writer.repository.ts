import type { OnModuleInit } from '@nestjs/common'
import { Inject, Injectable } from '@nestjs/common'
import type { IConcertWriterRepository } from '../../../domain/concert/repositories/concert-writer.repository.interface'
import { EntityManager } from 'typeorm'
import { Concert } from '../models/concert.entity'
import { ConcertDate } from '../models/concertDate.entity'
import { Seat } from '../models/seat.entity'
import { Reservation } from '../models/reservation.entity'
import { FailedUpdateSeatStatusError } from '../../../domain/concert/exceptions/failed-update-seat-status.exception'
import { FailedCreateReservationError } from '../../../domain/concert/exceptions/failed-create-reservation.exception'
import { SchedulerRegistry } from '@nestjs/schedule'
import { FailedUpdateReservationError } from '../../../domain/concert/exceptions/faild-update-reservation.exception'
import { v4 as uuidv4 } from 'uuid'
import { DuplicateReservationError } from 'src/domain/concert/exceptions/duplicate-reservation.exception'

@Injectable()
export class ConcertWriterRepositoryTypeORM implements IConcertWriterRepository, OnModuleInit {
    constructor(
        @Inject(EntityManager) private readonly entityManager: EntityManager,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    /**
     * Truncates relevant tables on module initialization.
     * cause emtpy tables for waiting users and valid tokens.
     */
    async onModuleInit(): Promise<void> {
        await this.entityManager.query('TRUNCATE TABLE valid_token')
        await this.entityManager.query('TRUNCATE TABLE waiting_user')
    }

    /**
     * Creates a new concert with a given singer name.
     * @param singerName The name of the singer for the concert.
     * @returns The created Concert entity.
     */
    async createConcert(singerName: string): Promise<Concert> {
        const uuid = uuidv4()
        return await this.entityManager.save(Concert, { id: uuid, singerName })
    }

    /**
     * Creates a new concert date for a specific concert.
     * @param concert The Concert entity for which to create the date.
     * @param date The date of the concert.
     * @returns The created ConcertDate entity.
     */
    async createConcertDate(concert: Concert, date: Date): Promise<ConcertDate> {
        const uuid = uuidv4()
        return this.entityManager.save(ConcertDate, { id: uuid, availableSeats: parseInt(process.env.MAX_SEATS, 10), concert, date })
    }

    /**
     * Creates a new seat for a specific concert date.
     * @param concertDate The ConcertDate entity for which to create the seat.
     * @param seatNumber The number of the seat.
     * @param price The price of the seat.
     * @returns The created Seat entity.
     */
    createSeat(concertDate: ConcertDate, seatNumber: number, price: number): Promise<Seat> {
        const uuid = uuidv4()
        return this.entityManager.save(Seat, { id: uuid, concertDate, seatNumber, price })
    }

    /**
     * Creates a new reservation for a specific seat by a user.
     * @param seat The Seat entity for which to create the reservation.
     * @param userId The ID of the user making the reservation.
     * @returns The created Reservation entity.
     * @throws DuplicateReservationError if the reservation already exists.
     * @throws FailedCreateReservationError if there is an error creating the reservation.
     */
    async createReservation(seat: Seat, userId: string): Promise<Reservation> {
        const uuid = uuidv4()
        let reservation

        try {
            reservation = await this.entityManager.save(Reservation, {
                id: uuid,
                userId,
                seat,
                concert: seat.concertDate.concert,
                concertDate: seat.concertDate,
                holdExpiresAt: new Date(Date.now() + 1000 * 60 * 5), // 5분
            })
        } catch (error) {
            // Unique constraint violation check
            if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
                throw new DuplicateReservationError('Reservation already exists for the given seat and concert date.')
            } else {
                console.log(userId, seat)

                throw new FailedCreateReservationError(error.message)
            }
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

    /**
     * Finalizes the payment for a reservation, updating its status to paid.
     * @param reservation The Reservation entity to update.
     * @throws FailedUpdateReservationError if updating the reservation fails.
     */
    async doneReservationPaid(reservation: Reservation, querryRunner?: any) {
        const manager = querryRunner ? querryRunner.manager : this.entityManager

        const paymentUpdateResult = await manager
            .createQueryBuilder()
            .update(Reservation)
            .set({ paymentCompleted: true })
            .where('id = :id', { id: reservation.id })
            .execute()

        if (paymentUpdateResult.affected === 0) {
            throw new FailedUpdateReservationError('Failed to update reservation payment status.')
        }

        const result = await this.updateSeatStatus(reservation.seat.id, 'held', querryRunner)

        if (result === false) {
            throw new FailedUpdateSeatStatusError('Failed to update seat status')
        }

        const reservationScheduler = this.schedulerRegistry.doesExist('timeout', reservation.id)
        if (reservationScheduler) {
            clearTimeout(this.schedulerRegistry.getTimeout(reservation.id))
        }
    }

    /**
     * Updates the status of a seat.
     * @param id The ID of the seat to update.
     * @param status The new status of the seat.
     * @returns True if the update was successful, otherwise false.
     */
    private async updateSeatStatus(id: string, status: string, querryRunner?: any): Promise<boolean> {
        const manager = querryRunner ? querryRunner.manager : this.entityManager

        return await manager
            .createQueryBuilder()
            .update(Seat)
            .set({ status })
            .where('id = :id', { id }) // Add a comma after the placeholder
            .execute()
            .then(result => result.affected > 0)
    }

    /**
     * Updates the number of available seats for a concert date.
     * @param concertDateId The ID of the concert date to update.
     * @param amount The amount to adjust the available seats by.
     */
    async updateConcertDateAvailableSeat(concertDateId: string, amount: number) {
        await this.entityManager
            .createQueryBuilder()
            .update(ConcertDate)
            .set({ availableSeats: () => `availableSeats + ${amount}` })
            .where('id = :id', { id: concertDateId })
            .execute()
    }
}
