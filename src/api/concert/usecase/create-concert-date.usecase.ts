import { Injectable } from '@nestjs/common'
import { IConcertReaderRepository } from 'src/domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepository } from 'src/domain/concert/repositories/concert-writer.repository.interface'
import type { IConcertDate } from 'src/domain/concert/models/concertDate.entity.interface'

@Injectable()
export class CreateConcertDateUseCase {
    constructor(
        private readonly concertReaderRepository: IConcertReaderRepository,
        private readonly concertWriterRepository: IConcertWriterRepository,
    ) {}

    async excute(concertId: string, date: Date): Promise<IConcertDate> {
        const concert = await this.concertReaderRepository.findConcertById(concertId)

        return await this.concertWriterRepository.createConcertDate(concert, date)
    }
}
