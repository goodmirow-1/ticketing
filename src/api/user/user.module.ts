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

@Module({
    imports: [TypeOrmModule.forFeature([User, PointHistory])],
    controllers: [UserController],
    providers: [
        ChargeUserPointUseCase,
        CreateUserUseCase,
        ReadUserPointUseCase,
        {
            provide: IUserReaderRepositoryToken,
            useClass: UserReaderRepositoryTypeORM,
        },
        {
            provide: IUserWriterRepositoryToken,
            useClass: UserWriterRepositoryTypeORM,
        },
        {
            provide: DataAccessorToken,
            useClass: TypeORMDataAccessor,
        },
    ],
    exports: [],
})
export class UserModule {}
