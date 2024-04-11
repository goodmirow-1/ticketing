import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/infrastructure/user/models/user.entity'
import { PointHistory } from 'src/infrastructure/user/models/point-history.entity'
import { Reservation } from 'src/infrastructure/concert/models/reservation.entity'
import { PaymentUserConcertUseCase } from '../../application/user-concert-waiting/usecase/payment-user-concert.usecase'
import { ConcertReaderRepositoryTypeORM } from 'src/infrastructure/concert/repositories/concert-reader.repository'
import { UserWriterRepositoryTypeORM } from 'src/infrastructure/user/repositories/user-writer.repository'
import { ConcertWriterRepositoryTypeORM } from 'src/infrastructure/concert/repositories/concert-writer.repository'
import { UserConcertWaitingController } from './user-concert-waiting.controller'
import { WaitingWriterRepositoryTypeORM } from 'src/infrastructure/waiting/repositories/waiting-writer.repository'
import { IConcertReaderRepositoryToken } from 'src/domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepositoryToken } from 'src/domain/concert/repositories/concert-writer.repository.interface'
import { IUserWriterRepositoryToken } from 'src/domain/user/repositories/user-writer.repository.interface'
import { IWaitingWriterRepositoryToken } from 'src/domain/waiting/repositories/waiting-writer.repository.interface'

@Module({
    imports: [TypeOrmModule.forFeature([User, Reservation, PointHistory])],
    controllers: [UserConcertWaitingController],
    providers: [
        PaymentUserConcertUseCase,
        {
            provide: IConcertReaderRepositoryToken,
            useClass: ConcertReaderRepositoryTypeORM,
        },
        {
            provide: IConcertWriterRepositoryToken,
            useClass: ConcertWriterRepositoryTypeORM,
        },
        {
            provide: IUserWriterRepositoryToken,
            useClass: UserWriterRepositoryTypeORM,
        },
        {
            provide: IWaitingWriterRepositoryToken,
            useClass: WaitingWriterRepositoryTypeORM,
        },
    ],
    exports: [],
})
export class UserConcertWaitingModule {}
