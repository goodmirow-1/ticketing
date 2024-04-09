import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository } from 'src/domain/concert/repositories/concert-reader.repository.interface'
import type { ISeat } from 'src/domain/concert/models/seat.entity.interface'

@Injectable()
export class ReadAllSeatsByConcertDateIdUseCase {
    constructor(
        @Inject('IConcertReaderRepository')
        private readonly concertReaderRepository: IConcertReaderRepository,
    ) {}

    async excute(concertDateId: string): Promise<ISeat[]> {
        return await this.concertReaderRepository.findSeatsByConcertDateId(concertDateId)
    }
}
