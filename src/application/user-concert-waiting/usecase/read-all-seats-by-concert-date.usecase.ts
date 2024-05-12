import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import type { ReadAllSeatsByConcertDateRequestType } from '../dtos/read-all-seats-by-concert-date.dto'
import { ReadAllSeatsByConcertResponseDto } from '../dtos/read-all-seats-by-concert-date.dto'
import type { IRequestDTO } from 'src/application/common/request.interface'
import { IWaitingReaderRedisRepository, IWaitingReaderRepositoryRedisToken } from 'src/domain/user/repositories/waiting-reader-redis.repository.interface'

@Injectable()
export class ReadAllSeatsByConcertDateIdUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject(IWaitingReaderRepositoryRedisToken)
        private readonly waitingReaderRepository: IWaitingReaderRedisRepository,
    ) {}

    async execute(requestDto: IRequestDTO<ReadAllSeatsByConcertDateRequestType>): Promise<ReadAllSeatsByConcertResponseDto> {
        requestDto.validate()

        const { concertDateId, userId } = requestDto.toUseCaseInput()

        //토큰 유효성 조회
        await this.waitingReaderRepository.validateUser(userId)
        //콘서트 날짜 목록 조회
        const seats = await this.concertReaderRepository.findSeatsByConcertDateId(concertDateId)
        return new ReadAllSeatsByConcertResponseDto(seats)
    }
}
