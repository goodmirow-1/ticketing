import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../../infrastructure/user/models/user.entity'
import { WaitingUser } from '../../infrastructure/waiting/models/waiting-user.entity'
import { ValidToken } from '../../infrastructure/waiting/models/valid-token.entity'
import { GenerateTokenUseCase } from '../../application/user-waiting/usecase/generate-token.usecase'
import { WaitingReaderRepositoryTypeORM } from '../../infrastructure/waiting/repositories/waiting-reader.repository'
import { WaitingWriterRepositoryTypeORM } from '../../infrastructure/waiting/repositories/waiting-writer.repository'
import { UserReaderRepositoryTypeORM } from '../../infrastructure/user/repositories/user-reader.repository'
import { TypeORMDataAccessor } from '../../infrastructure/db/typeorm/typeorm-data-accesor'
import { UserWaitingController } from './user-waiting.controller'
import { GenerateWaitingTokenUseCase } from '../../application/user-waiting/usecase/generate-waiting-token.usecase'
import { IUserReaderRepositoryToken } from '../../domain/user/repositories/user-reader.repository.interface'
import { IWaitingReaderRepositoryToken } from '../../domain/waiting/repositories/waiting-reader.repository.interface'
import { IWaitingWriterRepositoryToken } from '../../domain/waiting/repositories/waiting-writer.repository.interface'
import { DataAccessorToken } from '../../infrastructure/db/data-accesor.interface'

@Module({
    imports: [TypeOrmModule.forFeature([User, WaitingUser, ValidToken])],
    controllers: [UserWaitingController],
    providers: [
        GenerateTokenUseCase,
        GenerateWaitingTokenUseCase,
        {
            provide: IUserReaderRepositoryToken,
            useClass: UserReaderRepositoryTypeORM,
        },
        {
            provide: IWaitingReaderRepositoryToken,
            useClass: WaitingReaderRepositoryTypeORM,
        },
        {
            provide: IWaitingWriterRepositoryToken,
            useClass: WaitingWriterRepositoryTypeORM,
        },
        {
            provide: DataAccessorToken,
            useClass: TypeORMDataAccessor,
        },
    ],
    exports: [],
})
export class UserWaitingModule {}
