import { Injectable } from '@nestjs/common'
import { IConcertReaderRepository } from '../repositories/concert-reader.repository.interface'
import { IConcertWriterRepository } from '../repositories/concert-writer.repository.interface'
import { DataAccessor } from 'src/infrastructure/db/data-accesor.interface'
import type { IConcert } from '../../models/concert.entity.interface'
import type { IConcertDate } from '../../models/concertDate.entity.interface'
import type { ISeat } from '../../models/seat.entity.interface'
import type { IReservation } from '../../models/reservation.entity.interface'

@Injectable()
export class ConcertService {
    constructor(
        private readonly concertReaderRepository: IConcertReaderRepository,
        private readonly concertWriterRepository: IConcertWriterRepository,
        private readonly dataAccessor: DataAccessor,
    ) {}

    async createConcert(singerName: string): Promise<IConcert> {
        return this.concertWriterRepository.createConcert(singerName)
    }

    async createConcertDate(concertId: string, date: Date): Promise<IConcertDate> {
        const concert = await this.concertReaderRepository.findConcertById(concertId)

        return await this.concertWriterRepository.createConcertDate(concert, date)
    }

    async findAllConcertsByDate(): Promise<IConcert[]> {
        return this.concertReaderRepository.findAllConcertsByDate()
    }

    async createSeat(concertDateId: string, seatNumber: number): Promise<ISeat> {
        const concertDate = await this.concertReaderRepository.findConcertDateById(concertDateId)

        return await this.concertWriterRepository.createSeat(concertDate, seatNumber)
    }

    async findSeatsByConcertDate(concertDateId: string): Promise<ISeat[]> {
        return await this.concertReaderRepository.findSeatsByConcertDate(concertDateId)
    }

    async createReservation(seatId: string, userId: string): Promise<IReservation> {
        const seat = await this.concertReaderRepository.findSeatById(seatId)
        const reservation = await this.concertWriterRepository.createReservation(seat, userId)

        return reservation
    }
}
