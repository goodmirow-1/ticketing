import { Injectable } from '@nestjs/common'
import { IConcertReaderRepository } from 'src/domain/concert/repositories/concert-reader.repository.interface'
import type { IConcert } from 'src/domain/concert/models/concert.entity.interface'

@Injectable()
export class ReadAllConcertsUseCase {
    constructor(private readonly concertReaderRepository: IConcertReaderRepository) {}

    async excute(): Promise<IConcert[]> {
        return this.concertReaderRepository.findAllConcerts()
    }
}
