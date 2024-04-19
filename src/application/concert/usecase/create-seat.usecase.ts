import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from '../../../domain/concert/repositories/concert-writer.repository.interface'
import type { ISeat } from '../../../domain/concert/models/seat.entity.interface'

@Injectable()
export class CreateSeatUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject(IConcertWriterRepositoryToken)
        private readonly concertWriterRepository: IConcertWriterRepository,
    ) {}

    async excute(concertDateId: string, seatNumber: number, price: number): Promise<ISeat> {
        //유효한 seatNumber인지
        await this.concertReaderRepository.checkValidSeatNumber(concertDateId, seatNumber)
        //콘서트 날짜 조회
        const concertDate = await this.concertReaderRepository.findConcertDateById(concertDateId)
        //좌석 저장
        return await this.concertWriterRepository.createSeat(concertDate, seatNumber, price)
    }
}
