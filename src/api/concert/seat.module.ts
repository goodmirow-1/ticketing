import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SeatController } from './seat.controller'
import { Seat } from 'src/domain/concert/business/infrastructure/db/typeorm/models/seat.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Seat])],
    controllers: [SeatController],
    providers: [],
    exports: [],
})
export class SeatModule {}
