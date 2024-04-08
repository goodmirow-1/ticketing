import { Injectable } from '@nestjs/common'
import { DataAccessor } from 'src/infrastructure/db/data-accesor.interface'
import { IUserReaderRepository } from '../user/business/repositories/user-reader.repository.interface'
import { IUserWriterRepository } from '../user/business/repositories/user-writer.repository.interface'
import { IConcertReaderRepository } from '../concert/business/repositories/concert-reader.repository.interface'
import type { IPointHistory } from '../user/models/point-history.entity.interface'
import { IConcertWriterRepository } from '../concert/business/repositories/concert-writer.repository.interface'

@Injectable()
export class UserConcertService {
    constructor(
        private readonly userReaderRepository: IUserReaderRepository,
        private readonly userWriterRepository: IUserWriterRepository,
        private readonly concertReaderRepository: IConcertReaderRepository,
        private readonly concertWriterRepository: IConcertWriterRepository,
        private readonly dataAccessor: DataAccessor,
    ) {}

    async payment(reservationId: string): Promise<IPointHistory> {
        const reservation = await this.concertReaderRepository.findReservationById(reservationId)
        const pointHistory = await this.userWriterRepository.calculatePoint(reservation.user, -reservation.amount, 'payment')

        return pointHistory
    }
}
