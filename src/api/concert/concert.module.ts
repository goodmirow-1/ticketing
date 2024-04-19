import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConcertController } from './concert.controller'
import { ConcertDate } from '../../infrastructure/concert/models/concertDate.entity'
import { Concert } from '../../infrastructure/concert/models/concert.entity'
import { Seat } from '../../infrastructure/concert/models/seat.entity'
import { CreateConcertUseCase } from '../../application/concert/usecase/create-concert.usecase'
import { CreateConcertDateUseCase } from '../../application/concert/usecase/create-concert-date.usecase'
import { CreateSeatUseCase } from '../../application/concert/usecase/create-seat.usecase'
import { ConcertReaderRepositoryTypeORM } from '../../infrastructure/concert/repositories/concert-reader.repository'
import { ConcertWriterRepositoryTypeORM } from '../../infrastructure/concert/repositories/concert-writer.repository'
import { IConcertReaderRepositoryToken } from '../../domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepositoryToken } from '../../domain/concert/repositories/concert-writer.repository.interface'
import { CreateReservationUseCase } from '../../application/concert/usecase/create-reservation.usecase'
import { ReadAllConcertsUseCase } from '../../application/concert/usecase/read-all-concerts.usecase'
import { ReadAllSeatsByConcertDateIdUseCase } from '../../application/concert/usecase/read-all-seats-by-concert-date.usecase'

@Module({
    imports: [TypeOrmModule.forFeature([Concert, ConcertDate, Seat])],
    controllers: [ConcertController],
    providers: [
        CreateConcertUseCase,
        CreateConcertDateUseCase,
        CreateSeatUseCase,
        CreateReservationUseCase,
        ReadAllConcertsUseCase,
        ReadAllSeatsByConcertDateIdUseCase,
        {
            provide: IConcertReaderRepositoryToken,
            useClass: ConcertReaderRepositoryTypeORM,
        },
        {
            provide: IConcertWriterRepositoryToken,
            useClass: ConcertWriterRepositoryTypeORM,
        },
    ],
    exports: [],
})
export class ConcertModule {}
