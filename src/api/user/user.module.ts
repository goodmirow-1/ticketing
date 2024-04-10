import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/infrastructure/user/models/user.entity'
import { UserController } from './user.controller'
import { PointHistory } from 'src/infrastructure/user/models/point-history.entity'
import { ChargeUserPointUseCase } from '../../application/user/usecase/charge-user-point.usecase'
import { CreateUserUseCase } from '../../application/user/usecase/create-user.usecase'
import { ReadUserPointUseCase } from '../../application/user/usecase/read-user-point.usecase'
import { UserWriterRepositoryTypeORM } from 'src/infrastructure/user/repositories/user-writer.repository'
import { UserReaderRepositoryTypeORM } from 'src/infrastructure/user/repositories/user-reader.repository'
import { TypeORMDataAccessor } from 'src/infrastructure/db/typeorm/typeorm-data-accesor'

@Module({
    imports: [TypeOrmModule.forFeature([User, PointHistory])],
    controllers: [UserController],
    providers: [
        ChargeUserPointUseCase,
        CreateUserUseCase,
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
