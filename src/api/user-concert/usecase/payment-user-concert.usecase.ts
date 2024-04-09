import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository } from 'src/domain/concert/repositories/concert-reader.repository.interface'
import type { IPointHistory } from 'src/domain/user/models/point-history.entity.interface'
import { IUserWriterRepository } from 'src/domain/user/repositories/user-writer.repository.interface'

@Injectable()
export class PaymentUserConcertUseCase {
    constructor(
        @Inject('IConcertReaderRepository')
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject('IUserWriterRepository')
        private readonly userWriterRepository: IUserWriterRepository,
    ) {}

    async excute(reservationId: string): Promise<IPointHistory> {
        const reservation = await this.concertReaderRepository.findReservationById(reservationId)
        const pointHistory = await this.userWriterRepository.calculatePoint(reservation.user, -reservation.amount, 'payment')

        return pointHistory
    }
}
