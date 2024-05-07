import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../../infrastructure/user/models/user.entity'
import { PointHistory } from '../../infrastructure/user/models/point-history.entity'
import { Reservation } from '../../infrastructure/concert/models/reservation.entity'
import { PaymentUserConcertUseCase } from '../../application/user-concert-waiting/usecase/payment-user-concert.usecase'
import { ConcertReaderRepositoryTypeORM } from '../../infrastructure/concert/repositories/concert-reader.repository'
import { UserWriterRepositoryTypeORM } from '../../infrastructure/user/repositories/user-writer.repository'
import { ConcertWriterRepositoryTypeORM } from '../../infrastructure/concert/repositories/concert-writer.repository'
import { UserConcertWaitingController } from './user-concert-waiting.controller'
import { IConcertReaderRepositoryToken } from '../../domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepositoryToken } from '../../domain/concert/repositories/concert-writer.repository.interface'
import { IUserWriterRepositoryToken } from '../../domain/user/repositories/user-writer.repository.interface'
import { IUserReaderRepositoryToken } from 'src/domain/user/repositories/user-reader.repository.interface'
import { UserReaderRepositoryTypeORM } from 'src/infrastructure/user/repositories/user-reader.repository'
import { DataAccessorToken } from 'src/infrastructure/db/data-accesor.interface'
import { TypeORMDataAccessor } from 'src/infrastructure/db/typeorm/typeorm-data-accesor'
import { IWaitingWriterRepositoryRedisToken } from 'src/domain/user/repositories/waiting-writer-redis.repository.interface'
import { WaitingWriterRepositoryRedis } from 'src/infrastructure/user/repositories/waiting-writer-redis.repository'
import { RedisService } from 'src/infrastructure/db/redis/redis-service'
import { IWaitingReaderRepositoryRedisToken } from 'src/domain/user/repositories/waiting-reader-redis.repository.interface'
import { WaitingReaderRepositoryRedis } from 'src/infrastructure/user/repositories/waiting-reader-redis.repository'
import { CreateReservationUseCase } from '../../application/user-concert-waiting/usecase/create-reservation.usecase'
import { ReadAllConcertsUseCase } from '../../application/user-concert-waiting/usecase/read-all-concerts.usecase'
import { ReadAllSeatsByConcertDateIdUseCase } from '../../application/user-concert-waiting/usecase/read-all-seats-by-concert-date.usecase'

@Module({
    imports: [TypeOrmModule.forFeature([User, Reservation, PointHistory])],
    controllers: [UserConcertWaitingController],
    providers: [
        PaymentUserConcertUseCase,
        CreateReservationUseCase,
        ReadAllConcertsUseCase,
        ReadAllSeatsByConcertDateIdUseCase,
        RedisService,
        {
            provide: IConcertReaderRepositoryToken,
            useClass: ConcertReaderRepositoryTypeORM,
        },
        {
            provide: IConcertWriterRepositoryToken,
            useClass: ConcertWriterRepositoryTypeORM,
        },
        {
            provide: IUserReaderRepositoryToken,
            useClass: UserReaderRepositoryTypeORM,
        },
        {
            provide: IUserWriterRepositoryToken,
            useClass: UserWriterRepositoryTypeORM,
        },
        {
            provide: IWaitingReaderRepositoryRedisToken,
            useClass: WaitingReaderRepositoryRedis,
        },
        {
            provide: IWaitingWriterRepositoryRedisToken,
            useClass: WaitingWriterRepositoryRedis,
        },
        {
            provide: DataAccessorToken,
            useClass: TypeORMDataAccessor,
        },
    ],
    exports: [],
})
export class UserConcertWaitingModule {}
