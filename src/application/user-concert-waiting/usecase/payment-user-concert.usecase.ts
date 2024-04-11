import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from '../../../domain/concert/repositories/concert-writer.repository.interface'
import type { IPointHistory } from '../../../domain/user/models/point-history.entity.interface'
import { IUserWriterRepository, IUserWriterRepositoryToken } from '../../../domain/user/repositories/user-writer.repository.interface'
import { IWaitingWriterRepository, IWaitingWriterRepositoryToken } from '../../../domain/waiting/repositories/waiting-writer.repository.interface'

@Injectable()
export class PaymentUserConcertUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject(IConcertWriterRepositoryToken)
        private readonly concertWriterRepository: IConcertWriterRepository,
        @Inject(IUserWriterRepositoryToken)
        private readonly userWriterRepository: IUserWriterRepository,
        @Inject(IWaitingWriterRepositoryToken)
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
