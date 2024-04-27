import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import { ReadAllConcertsResponseDto } from '../dtos/read-all-concerts.dto'

@Injectable()
export class ReadAllConcertsUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
    ) {}

    async execute(): Promise<ReadAllConcertsResponseDto> {
        //콘서트 목록 조회
        const concerts = await this.concertReaderRepository.findAllConcerts()
        return new ReadAllConcertsResponseDto(concerts)
    }
}
