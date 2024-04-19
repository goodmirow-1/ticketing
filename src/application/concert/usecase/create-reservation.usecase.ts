import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from '../../../domain/concert/repositories/concert-writer.repository.interface'
import type { IReservation } from '../../../domain/concert/models/reservation.entity.interface'

@Injectable()
export class CreateReservationUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject(IConcertWriterRepositoryToken)
        private readonly concertWriterRepository: IConcertWriterRepository,
    ) {}

    async excute(seatId: string, userId: string): Promise<IReservation> {
        //좌석 조회
        const seat = await this.concertReaderRepository.findSeatById(seatId)
        //예약 저장
        const reservation = await this.concertWriterRepository.createReservation(seat, userId)
        //좌석의 상태 값 수정
        await this.concertWriterRepository.updateConcertDateAvailableSeat(seat.concertDate.id, -1)

        return reservation
    }
}
