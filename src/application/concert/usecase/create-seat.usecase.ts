import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from '../../../domain/concert/repositories/concert-writer.repository.interface'
import type { CreateSeatRequestType } from '../dtos/create-seat.dto'
import { CreateSeatResponseDto } from '../dtos/create-seat.dto'
import type { IRequestDTO } from 'src/application/common/request.interface'

@Injectable()
export class CreateSeatUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject(IConcertWriterRepositoryToken)
        private readonly concertWriterRepository: IConcertWriterRepository,
    ) {}

    async execute(requestDto: IRequestDTO<CreateSeatRequestType>): Promise<CreateSeatResponseDto> {
        requestDto.validate()

        const { concertDateId, seatNumber, price } = requestDto.toUseCaseInput()

        //콘서트 날짜 조회
        const concertDate = await this.concertReaderRepository.findConcertDateById(concertDateId)

        //유효한 seatNumber인지
        await this.concertReaderRepository.checkValidSeatNumber(concertDateId, seatNumber)

        //좌석 저장
        const seat = await this.concertWriterRepository.createSeat(concertDate, seatNumber, price)
        return new CreateSeatResponseDto(seat.id, seat.seatNumber, seat.price, seat.concertDate, seat.status)
    }
}
