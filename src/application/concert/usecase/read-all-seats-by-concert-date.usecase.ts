import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import type { ReadAllSeatsByConcertDateRequestType } from '../dtos/read-all-seats-by-concert-date.dto'
import { ReadAllSeatsByConcertResponseDto } from '../dtos/read-all-seats-by-concert-date.dto'
import type { IRequestDTO } from 'src/application/common/request.interface'

@Injectable()
export class ReadAllSeatsByConcertDateIdUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
    ) {}

    async execute(requestDto: IRequestDTO<ReadAllSeatsByConcertDateRequestType>): Promise<ReadAllSeatsByConcertResponseDto> {
        requestDto.validate()

        const { concertDateId } = requestDto.toUseCaseInput()
        //콘서트 날짜 목록 조회
        const seats = await this.concertReaderRepository.findSeatsByConcertDateId(concertDateId)
        return new ReadAllSeatsByConcertResponseDto(seats)
    }
}
