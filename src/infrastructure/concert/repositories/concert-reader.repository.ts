import { Inject, Injectable } from '@nestjs/common'
import type { IConcertReaderRepository } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import { EntityManager } from 'typeorm'
import { Concert } from '../models/concert.entity'
import { Seat } from '../models/seat.entity'
import { ConcertDate } from '../models/concertDate.entity'
import { NotFoundConcertError } from '../../../domain/concert/exceptions/not-found-concert.exception'
import { NotFoundSeatError } from '../../../domain/concert/exceptions/not-found-seat.exception'
import { NotAvailableSeatError } from '../../../domain/concert/exceptions/not-available-seat.exception'
import { Reservation } from '../models/reservation.entity'
import { InValidSeatNumberError } from '../../../domain/concert/exceptions/invalid-seat-number.exception'
import { DuplicateConcertDateError } from '../../../domain/concert/exceptions/duplicate-concert-date.exception'
import { NotFoundReservationError } from 'src/domain/user/exceptions/not-found-reservation.exception'

@Injectable()
export class ConcertReaderRepositoryTypeORM implements IConcertReaderRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

    /**
     * Checks if a concert date already exists in the database.
     * @param date Date of the concert to check
     * @throws DuplicateConcertDateError if the concert date already exists
     */
    async checkValidConcertDateByDate(date: Date) {
        const existingConcertDate = await this.entityManager.findOne(ConcertDate, { where: { date } })

        if (existingConcertDate) {
            throw new DuplicateConcertDateError(`Concert date ${date} already exists`)
        }
    }

    /**
     * Validates if the seat number is within the allowed range and not already taken.
     * @param concertDateId ID of the concert date
     * @param seatNumber Number of the seat to check
     * @throws InValidSeatNumberError if the seat number is invalid or already exists
     */
    async checkValidSeatNumber(concertDateId: string, seatNumber: number) {
        if (seatNumber < 1 || seatNumber > parseInt(process.env.MAX_SEATS, 10)) {
            throw new InValidSeatNumberError(`Seat number must be between 1 and max seats`)
        }

        const seat = await this.entityManager.findOne(Seat, { where: { id: concertDateId, seatNumber } })

        if (seat) throw new InValidSeatNumberError(`Seat number ${seatNumber} already exists`)
    }

    /**
     * Finds a concert by its ID.
     * @param id ID of the concert to find
     * @returns The found concert entity
     * @throws NotFoundConcertError if the concert is not found
     */
    async findConcertById(id: string): Promise<Concert> {
        const concert = await this.entityManager.findOne(Concert, { where: { id }, relations: ['concertDates'] })

        if (!concert) throw new NotFoundConcertError(`Concert id ${id} not found`)

        return concert
    }

    /**
     * Retrieves all concerts from the database.
     * @returns Array of concert entities
     */
    async findAllConcerts(): Promise<Concert[]> {
        return this.entityManager.find(Concert, { relations: ['concertDates'] })
    }

    /**
     * Finds a concert date by its ID.
     * @param id ID of the concert date to find
     * @returns The found concert date entity
     * @throws NotFoundConcertError if the concert date is not found
     */
    async findConcertDateById(id: string): Promise<ConcertDate> {
        return this.entityManager.findOne(ConcertDate, { where: { id } })
    }

    /**
     * Finds a seat by its ID.
     * @param id ID of the seat to find
     * @returns The found seat entity
     * @throws NotFoundSeatError if the seat is not found
     */
    async findSeatById(id: string): Promise<Seat> {
        const seat = await this.entityManager.findOne(Seat, { where: { id }, relations: ['concertDate', 'concertDate.concert'] })

        if (!seat) throw new NotFoundSeatError(`Seat id ${id} not found`)

        return seat
    }

    /**
     * Finds all seats for a given concert date.
     * @param id ID of the concert date
     * @returns Array of seat entities
     * @throws NotFoundConcertError if no seats are available or the concert date is not found
     */
    async findSeatsByConcertDateId(id: string): Promise<Seat[]> {
        const concertDate = await this.entityManager.findOne(ConcertDate, { where: { id }, relations: ['seats'] })

        if (!concertDate) throw new NotFoundConcertError(`Concert date id ${id} not found`)
        if (concertDate.availableSeats === 0) throw new NotAvailableSeatError(`No seats available for concert date id ${id}`)

        return this.entityManager.find(Seat, { where: { concertDate } })
    }

    /**
     * Finds a reservation by its ID.
     * @param id ID of the reservation to find
     * @returns The found reservation entity
     * @throws NotFoundReservationError if the reservation is not found
     */
    async findReservationById(id: string): Promise<Reservation> {
        const reservation = await this.entityManager.findOne(Reservation, { where: { id }, relations: ['seat'] })

        if (!reservation) throw new NotFoundReservationError(`Reservation id ${id} not found`)

        return reservation
    }

    /**
     * Checks the validity of a reservation against a user ID.
     * @param reservation Reservation entity to check
     * @param userId User ID to validate against the reservation
     * @throws NotFoundReservationError if the reservation does not belong to the user
     */
    checkValidReservation(reservation: Reservation, userId: string) {
        if (reservation.userId != userId) {
            throw new NotFoundReservationError(`Invalid reservation id ${reservation.id} for user id ${userId}`)
        }
    }
}
