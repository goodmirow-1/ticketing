import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Reservation } from 'src/infrastructure/concert/models/reservation.entity'
import { ConcertController } from './concert.controller'
import { ConcertDate } from 'src/infrastructure/concert/models/concertDate.entity'
import { Concert } from 'src/infrastructure/concert/models/concert.entity'
import { Seat } from 'src/infrastructure/concert/models/seat.entity'
import { CreateConcertUseCase } from './usecase/create-concert.usecase'
import { CreateConcertDateUseCase } from './usecase/create-concert-date.usecase'
import { CreateReservationUseCase } from './usecase/create-reservation.usecase'
import { CreateSeatUseCase } from './usecase/create-seat.usecase'
import { ReadAllConcertsUseCase } from './usecase/read-all-concerts.usecase'
import { ReadAllSeatsByConcertDateIdUseCase } from './usecase/read-all-seats-by-concert-date.usecase'

@Module({
    imports: [TypeOrmModule.forFeature([Concert, ConcertDate, Reservation, Seat])],
    controllers: [ConcertController],
    providers: [
        CreateConcertUseCase,
        CreateConcertDateUseCase,
        CreateReservationUseCase,
        CreateSeatUseCase,
        ReadAllConcertsUseCase,
        ReadAllSeatsByConcertDateIdUseCase,
    ],
    exports: [],
})
export class ConcertModule {}
