import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import type { ISeat } from '../../../domain/concert/models/seat.entity.interface'

@Injectable()
export class ReadAllSeatsByConcertDateIdUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
    ) {}

    async excute(concertDateId: string): Promise<ISeat[]> {
        return await this.concertReaderRepository.findSeatsByConcertDateId(concertDateId)
    }
}
