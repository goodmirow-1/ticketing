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

@Module({
    imports: [TypeOrmModule.forFeature([User, WaitingUser, ValidToken])],
    controllers: [UserWaitingController],
    providers: [
        GenerateTokenUseCase,
        {
            provide: 'IUserReaderRepository',
            useClass: UserReaderRepositoryTypeORM,
        },
        {
            provide: 'IWaitingReaderRepository',
            useClass: WaitingReaderRepositoryTypeORM,
        },
        {
            provide: 'IWaitingWriterRepository',
            useClass: WaitingWriterRepositoryTypeORM,
        },
        {
            provide: 'DataAccessor',
            useValue: TypeORMDataAccessor,
        },
    ],
    exports: [],
})
export class UserWaitingModule {}
