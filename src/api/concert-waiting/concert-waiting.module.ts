import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConcertDate } from 'src/infrastructure/concert/models/concertDate.entity'
import { Concert } from 'src/infrastructure/concert/models/concert.entity'
import { Seat } from 'src/infrastructure/concert/models/seat.entity'
import { ConcertReaderRepositoryTypeORM } from 'src/infrastructure/concert/repositories/concert-reader.repository'
import { ConcertWriterRepositoryTypeORM } from 'src/infrastructure/concert/repositories/concert-writer.repository'
import { ConcertWaitingController } from './concert-waiting.controller'
import { CreateReservationUseCase } from './usecase/create-reservation.usecase'
import { ReadAllConcertsUseCase } from './usecase/read-all-concerts.usecase'
import { ReadAllSeatsByConcertDateIdUseCase } from './usecase/read-all-seats-by-concert-date.usecase'
import { ReadWaitingUserUseCase } from './usecase/read-waiting-user.usecase'
import { WaitingReaderRepositoryTypeORM } from 'src/infrastructure/waiting/repositories/waiting-reader.repository'

@Module({
    imports: [TypeOrmModule.forFeature([Concert, ConcertDate, Seat])],
    controllers: [ConcertWaitingController],
    providers: [
        CreateReservationUseCase,
        ReadAllConcertsUseCase,
        ReadAllSeatsByConcertDateIdUseCase,
        ReadWaitingUserUseCase,
        {
            provide: 'IConcertReaderRepository',
            useClass: ConcertReaderRepositoryTypeORM,
        },
        {
            provide: 'IConcertWriterRepository',
            useClass: ConcertWriterRepositoryTypeORM,
        },
        {
            provide: 'IWaitingReaderRepository',
            useClass: WaitingReaderRepositoryTypeORM,
        },
    ],
    exports: [],
})
export class ConcertWaitingModule {}
