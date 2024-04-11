import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from '../../../domain/concert/repositories/concert-writer.repository.interface'
import type { ISeat } from '../../../domain/concert/models/seat.entity.interface'

@Injectable()
export class CreateSeatUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject(IConcertWriterRepositoryToken)
        private readonly concertWriterRepository: IConcertWriterRepository,
    ) {}

    async excute(concertDateId: string, seatNumber: number, price: number): Promise<ISeat> {
        await this.concertReaderRepository.checkValidSeatNumber(seatNumber)
        const concertDate = await this.concertReaderRepository.findConcertDateById(concertDateId)

        return await this.concertWriterRepository.createSeat(concertDate, seatNumber, price)
    }
}
