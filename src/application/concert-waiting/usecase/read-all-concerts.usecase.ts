import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import type { IConcert } from '../../../domain/concert/models/concert.entity.interface'

@Injectable()
export class ReadAllConcertsUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
    ) {}

    async excute(): Promise<IConcert[]> {
        //콘서트 목록 조회
        return this.concertReaderRepository.findAllConcerts()
    }
}
