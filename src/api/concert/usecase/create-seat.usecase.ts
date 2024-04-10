import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository } from 'src/domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepository } from 'src/domain/concert/repositories/concert-writer.repository.interface'
import type { ISeat } from 'src/domain/concert/models/seat.entity.interface'

@Injectable()
export class CreateSeatUseCase {
    constructor(
        @Inject('IConcertReaderRepository')
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject('IConcertWriterRepository')
        private readonly concertWriterRepository: IConcertWriterRepository,
    ) {}

    async excute(concertDateId: string, seatNumber: number): Promise<ISeat> {
        await this.concertReaderRepository.checkValidSeatNumber(seatNumber)
        const concertDate = await this.concertReaderRepository.findConcertDateById(concertDateId)
        await this.concertReaderRepository.checkValidConcertDate(concertDate)

        return await this.concertWriterRepository.createSeat(concertDate, seatNumber)
    }
}
