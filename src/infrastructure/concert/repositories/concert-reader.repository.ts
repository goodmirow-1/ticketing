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

@Injectable()
export class ConcertReaderRepositoryTypeORM implements IConcertReaderRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

    async checkValidConcertDateByDate(date: Date) {
        const existingConcertDate = await this.entityManager.findOne(ConcertDate, { where: { date } })

        if (existingConcertDate) {
            throw new DuplicateConcertDateError(`Concert date ${date} already exists`)
        }
    }

    async checkValidSeatNumber(concertDateId: string, seatNumber: number) {
        if (seatNumber < 1 || seatNumber > parseInt(process.env.MAX_SEATS, 10)) {
            throw new InValidSeatNumberError(`Seat number must be between 1 and max seats`)
        }

        const seat = await this.entityManager.findOne(Seat, { where: { id: concertDateId, seatNumber } })

        if (seat) throw new InValidSeatNumberError(`Seat number ${seatNumber} already exists`)
    }

    async findConcertById(id: string): Promise<Concert> {
        const concert = await this.entityManager.findOne(Concert, { where: { id }, relations: ['concertDates'] })

        if (!concert) throw new NotFoundConcertError(`Concert id ${id} not found`)

        return concert
    }

    async findAllConcerts(): Promise<Concert[]> {
        return this.entityManager.find(Concert, { relations: ['concertDates'] })
    }

    async findConcertDateById(id: string): Promise<ConcertDate> {
        return this.entityManager.findOne(ConcertDate, { where: { id } })
    }

    async findSeatById(id: string): Promise<Seat> {
        const seat = await this.entityManager.findOne(Seat, { where: { id }, relations: ['concertDate', 'concertDate.concert'] })

        if (!seat) throw new NotFoundSeatError(`Seat id ${id} not found`)

        return seat
    }

    async findSeatsByConcertDateId(id: string): Promise<Seat[]> {
        const concertDate = await this.entityManager.findOne(ConcertDate, { where: { id }, relations: ['seats'] })

        if (!concertDate) throw new NotFoundConcertError(`Concert date id ${id} not found`)
        if (concertDate.availableSeats === 0) throw new NotAvailableSeatError(`No seats available for concert date id ${id}`)

        return this.entityManager.find(Seat, { where: { concertDate } })
    }

    async findReservationById(id: string): Promise<Reservation> {
        return this.entityManager.findOne(Reservation, { where: { id }, relations: ['seat', 'user'] })
    }
}
