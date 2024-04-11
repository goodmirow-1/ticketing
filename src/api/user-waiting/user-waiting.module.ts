import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/infrastructure/user/models/user.entity'
import { WaitingUser } from 'src/infrastructure/waiting/models/waiting-user.entity'
import { ValidToken } from 'src/infrastructure/waiting/models/valid-token.entity'
import { GenerateTokenUseCase } from '../../application/user-waiting/usecase/generate-token.usecase'
import { WaitingReaderRepositoryTypeORM } from 'src/infrastructure/waiting/repositories/waiting-reader.repository'
import { WaitingWriterRepositoryTypeORM } from 'src/infrastructure/waiting/repositories/waiting-writer.repository'
import { UserReaderRepositoryTypeORM } from 'src/infrastructure/user/repositories/user-reader.repository'
import { TypeORMDataAccessor } from 'src/infrastructure/db/typeorm/typeorm-data-accesor'
import { UserWaitingController } from './user-waiting.controller'
import { GenerateWaitingTokenUseCase } from 'src/application/user-waiting/usecase/generate-waiting-token.usecase'
import { IUserReaderRepositoryToken } from 'src/domain/user/repositories/user-reader.repository.interface'
import { IWaitingReaderRepositoryToken } from 'src/domain/waiting/repositories/waiting-reader.repository.interface'
import { IWaitingWriterRepositoryToken } from 'src/domain/waiting/repositories/waiting-writer.repository.interface'
import { DataAccessorToken } from 'src/infrastructure/db/data-accesor.interface'

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
            useValue: TypeORMDataAccessor,
        },
    ],
    exports: [],
})
export class UserWaitingModule {}
