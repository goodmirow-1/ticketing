import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../../infrastructure/user/models/user.entity'
import { UserController } from './user.controller'
import { PointHistory } from '../../infrastructure/user/models/point-history.entity'
import { ChargeUserPointUseCase } from '../../application/user/usecase/charge-user-point.usecase'
import { CreateUserUseCase } from '../../application/user/usecase/create-user.usecase'
import { ReadUserPointUseCase } from '../../application/user/usecase/read-user-point.usecase'
import { UserWriterRepositoryTypeORM } from '../../infrastructure/user/repositories/user-writer.repository'
import { UserReaderRepositoryTypeORM } from '../../infrastructure/user/repositories/user-reader.repository'
import { TypeORMDataAccessor } from '../../infrastructure/db/typeorm/typeorm-data-accesor'
import { IUserReaderRepositoryToken } from '../../domain/user/repositories/user-reader.repository.interface'
import { IUserWriterRepositoryToken } from '../../domain/user/repositories/user-writer.repository.interface'
import { DataAccessorToken } from '../../infrastructure/db/data-accesor.interface'
import { GenerateTokenUseCase } from 'src/application/user/usecase/generate-token.usecase'
import { RedisService } from 'src/infrastructure/db/redis/redis-service'
import { IWaitingReaderRepositoryToken } from 'src/domain/user/repositories/waiting-reader.repository.interface'
import { WaitingReaderRepository } from 'src/infrastructure/user/repositories/waiting-reader-redis.repository'
import { IWaitingWriterRepositoryToken } from 'src/domain/user/repositories/waiting-writer.repository.interface'
import { WaitingWriterRepository } from 'src/infrastructure/user/repositories/waiting-writer-redis.repository'
import { WaitingSchedulerUseCase } from 'src/application/user/usecase/waiting-scheduler.usecase'
import { CheckWaitingUseCase } from 'src/application/user/usecase/check-waiting.usecase'

@Module({
    imports: [TypeOrmModule.forFeature([User, PointHistory])],
    controllers: [UserController],
    providers: [
        ChargeUserPointUseCase,
        CreateUserUseCase,
        ReadUserPointUseCase,
        GenerateTokenUseCase,
        CheckWaitingUseCase,
        WaitingSchedulerUseCase,
        RedisService,
        {
            provide: IUserReaderRepositoryToken,
            useClass: UserReaderRepositoryTypeORM,
        },
        {
            provide: IUserWriterRepositoryToken,
            useClass: UserWriterRepositoryTypeORM,
        },
        {
            provide: IWaitingReaderRepositoryToken,
            useClass: WaitingReaderRepository,
        },
        {
            provide: IWaitingWriterRepositoryToken,
            useClass: WaitingWriterRepository,
        },
        {
            provide: DataAccessorToken,
            useClass: TypeORMDataAccessor,
        },
    ],
    exports: [],
})
export class UserModule {}
