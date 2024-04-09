import { Injectable } from '@nestjs/common'
import { IConcertReaderRepository } from 'src/domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepository } from 'src/domain/concert/repositories/concert-writer.repository.interface'
import type { ISeat } from 'src/domain/concert/models/seat.entity.interface'

@Injectable()
export class CreateSeatUseCase {
    constructor(
        private readonly concertReaderRepository: IConcertReaderRepository,
        private readonly concertWriterRepository: IConcertWriterRepository,
    ) {}

    async excute(concertDateId: string, seatNumber: number): Promise<ISeat> {
        const concertDate = await this.concertReaderRepository.findConcertDateById(concertDateId)

        return await this.concertWriterRepository.createSeat(concertDate, seatNumber)
    }
}
