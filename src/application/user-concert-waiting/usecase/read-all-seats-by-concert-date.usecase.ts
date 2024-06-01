import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import type { ReadAllSeatsByConcertDateRequestType } from '../dtos/read-all-seats-by-concert-date.dto'
import { ReadAllSeatsByConcertResponseDto } from '../dtos/read-all-seats-by-concert-date.dto'
import type { IRequestDTO } from 'src/application/common/request.interface'
import { IWaitingReaderRepository, IWaitingReaderRepositoryToken } from 'src/domain/user/repositories/waiting-reader.repository.interface'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from 'src/domain/concert/repositories/concert-writer.repository.interface'

@Injectable()
export class ReadAllSeatsByConcertDateIdUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject(IConcertWriterRepositoryToken)
        private readonly concertWriterRepository: IConcertWriterRepository,
        @Inject(IWaitingReaderRepositoryToken)
        private readonly waitingReaderRepository: IWaitingReaderRepository,
    ) {}

    async execute(requestDto: IRequestDTO<ReadAllSeatsByConcertDateRequestType>): Promise<ReadAllSeatsByConcertResponseDto> {
        requestDto.validate()

        const { concertDateId, userId } = requestDto.toUseCaseInput()

        //토큰 유효성 조회
        await this.waitingReaderRepository.validateUser(userId)

        // Redis 캐시 키 설정
        const cacheKey = `concert_seats_${concertDateId}`
        const cachedSeats = await this.concertReaderRepository.getSeatCache(cacheKey)

        if (cachedSeats) {
            return new ReadAllSeatsByConcertResponseDto(JSON.parse(cachedSeats))
        }

        //콘서트 날짜 목록 조회
        const seats = await this.concertReaderRepository.findSeatsByConcertDateId(concertDateId)

        // Redis에 데이터 캐싱 (5초 만료)
        await this.concertWriterRepository.setSeatCache(cacheKey, JSON.stringify(seats))

        return new ReadAllSeatsByConcertResponseDto(seats)
    }
}
