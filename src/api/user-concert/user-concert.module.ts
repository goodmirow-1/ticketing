import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/infrastructure/user/models/user.entity'
import { PointHistory } from 'src/infrastructure/user/models/point-history.entity'
import { Reservation } from 'src/infrastructure/concert/models/reservation.entity'
import { UserConcertController } from './user-concert.controller'
import { PaymentUserConcertUseCase } from './usecase/payment-user-concert.usecase'

@Module({
    imports: [TypeOrmModule.forFeature([User, Reservation, PointHistory])],
    controllers: [UserConcertController],
    providers: [PaymentUserConcertUseCase],
    exports: [],
})
export class UserConcertModule {}
