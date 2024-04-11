import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository } from 'src/domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepository } from 'src/domain/concert/repositories/concert-writer.repository.interface'
import type { IReservation } from 'src/domain/concert/models/reservation.entity.interface'

@Injectable()
export class CreateReservationUseCase {
    constructor(
        @Inject('IConcertReaderRepository')
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject('IConcertWriterRepository')
        private readonly concertWriterRepository: IConcertWriterRepository,
    ) {}

    async excute(seatId: string, userId: string): Promise<IReservation> {
        const seat = await this.concertReaderRepository.findSeatById(seatId)
        const reservation = await this.concertWriterRepository.createReservation(seat, userId)
        await this.concertWriterRepository.updateConcertDateAvailableSeat(seat.concertDate.id, -1)

        return reservation
    }
}
