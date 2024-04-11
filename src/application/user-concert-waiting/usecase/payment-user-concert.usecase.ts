import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository } from 'src/domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepository } from 'src/domain/concert/repositories/concert-writer.repository.interface'
import type { IPointHistory } from 'src/domain/user/models/point-history.entity.interface'
import { IUserWriterRepository } from 'src/domain/user/repositories/user-writer.repository.interface'
import { IWaitingWriterRepository } from 'src/domain/waiting/repositories/waiting-writer.repository.interface'

@Injectable()
export class PaymentUserConcertUseCase {
    constructor(
        @Inject('IConcertReaderRepository')
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject('IConcertWriterRepository')
        private readonly concertWriterRepository: IConcertWriterRepository,
        @Inject('IUserWriterRepository')
        private readonly userWriterRepository: IUserWriterRepository,
        @Inject('IWatingWriterRepository')
        private readonly waitingWriterRepository: IWaitingWriterRepository,
    ) {}

    async excute(reservationId: string, token?: string): Promise<IPointHistory> {
        const reservation = await this.concertReaderRepository.findReservationById(reservationId)
        const pointHistory = await this.userWriterRepository.calculatePoint(reservation.user, -reservation.seat.price, 'payment', reservation.id)
        await this.concertWriterRepository.doneReservationPaid(reservation)
        await this.waitingWriterRepository.expiredValidToken(token)

        return pointHistory
    }
}
