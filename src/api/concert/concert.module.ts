import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConcertController } from './concert.controller'
import { ConcertDate } from 'src/infrastructure/concert/models/concertDate.entity'
import { Concert } from 'src/infrastructure/concert/models/concert.entity'
import { Seat } from 'src/infrastructure/concert/models/seat.entity'
import { CreateConcertUseCase } from '../../application/concert/usecase/create-concert.usecase'
import { CreateConcertDateUseCase } from '../../application/concert/usecase/create-concert-date.usecase'
import { CreateSeatUseCase } from '../../application/concert/usecase/create-seat.usecase'
import { ConcertReaderRepositoryTypeORM } from 'src/infrastructure/concert/repositories/concert-reader.repository'
import { ConcertWriterRepositoryTypeORM } from 'src/infrastructure/concert/repositories/concert-writer.repository'

@Module({
    imports: [TypeOrmModule.forFeature([Concert, ConcertDate, Seat])],
    controllers: [ConcertController],
    providers: [
        CreateConcertUseCase,
        CreateConcertDateUseCase,
        CreateSeatUseCase,
        {
            provide: 'IConcertReaderRepository',
            useClass: ConcertReaderRepositoryTypeORM,
        },
        {
            provide: 'IConcertWriterRepository',
            useClass: ConcertWriterRepositoryTypeORM,
        },
    ],
    exports: [],
})
export class ConcertModule {}
