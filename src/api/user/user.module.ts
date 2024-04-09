import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/infrastructure/user/models/user.entity'
import { UserController } from './user.controller'
import { WaitingUser } from 'src/infrastructure/user/models/waiting-user.entity'
import { ValidToken } from 'src/infrastructure/user/models/valid-token.entity'
import { PointHistory } from 'src/infrastructure/user/models/point-history.entity'
import { ChargeUserPointUseCase } from './usecase/charge-user-point.usecase'
import { CreateUserUseCase } from './usecase/create-user.usecase'
import { GenerateTokenUseCase } from './usecase/generate-token.usecase'
import { ReadUserPointUseCase } from './usecase/read-user-point.usecase'
import { UserWriterRepositoryTypeORM } from 'src/infrastructure/user/repositories/user-writer.repository'
import { UserReaderRepositoryTypeORM } from 'src/infrastructure/user/repositories/user-reader.repository'
import { TypeORMDataAccessor } from 'src/infrastructure/db/typeorm/typeorm-data-accesor'

@Module({
    imports: [TypeOrmModule.forFeature([User, WaitingUser, ValidToken, PointHistory])],
    controllers: [UserController],
    providers: [
        ChargeUserPointUseCase,
        CreateUserUseCase,
        GenerateTokenUseCase,
        ReadUserPointUseCase,
        {
            provide: 'IUserReaderRepository',
            useClass: UserReaderRepositoryTypeORM,
        },
        {
            provide: 'IUserWriterRepository',
            useClass: UserWriterRepositoryTypeORM,
        },
        {
            provide: 'DataAccessor',
            useClass: TypeORMDataAccessor,
        },
    ],
    exports: [],
})
export class UserModule {}
