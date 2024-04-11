import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/infrastructure/user/models/user.entity'
import { PointHistory } from 'src/infrastructure/user/models/point-history.entity'
import { Reservation } from 'src/infrastructure/concert/models/reservation.entity'
import { UserConcertController } from './user-concert.controller'
import { PaymentUserConcertUseCase } from '../../application/user-concert/usecase/payment-user-concert.usecase'
import { ConcertReaderRepositoryTypeORM } from 'src/infrastructure/concert/repositories/concert-reader.repository'
import { UserWriterRepositoryTypeORM } from 'src/infrastructure/user/repositories/user-writer.repository'
import { ConcertWriterRepositoryTypeORM } from 'src/infrastructure/concert/repositories/concert-writer.repository'

@Module({
    imports: [TypeOrmModule.forFeature([User, Reservation, PointHistory])],
    controllers: [UserConcertController],
    providers: [
        PaymentUserConcertUseCase,
        {
            provide: 'IConcertReaderRepository',
            useClass: ConcertReaderRepositoryTypeORM,
        },
        {
            provide: 'IConcertWriterRepository',
            useClass: ConcertWriterRepositoryTypeORM,
        },
        {
            provide: 'IUserWriterRepository',
            useClass: UserWriterRepositoryTypeORM,
        },
    ],
    exports: [],
})
export class UserConcertModule {}
