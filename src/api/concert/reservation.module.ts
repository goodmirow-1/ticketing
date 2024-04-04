import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ReservationController } from './reservation.controller'
import { Reservation } from 'src/domain/concert/business/infrastructure/db/typeorm/models/reservation.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Reservation])],
    controllers: [ReservationController],
    providers: [],
    exports: [],
})
export class ReservationModule {}
