import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WaitingUser } from 'src/infrastructure/waiting/models/waiting-user.entity'
import { ValidToken } from 'src/infrastructure/waiting/models/valid-token.entity'
import { WaitingReaderRepositoryTypeORM } from 'src/infrastructure/waiting/repositories/waiting-reader.repository'
import { WaitingWriterRepositoryTypeORM } from 'src/infrastructure/waiting/repositories/waiting-writer.repository'
import { WaitingSchedulerUseCase } from '../../application/waiting/usecase/waiting-scheduler.usecase'
import { IWaitingReaderRepositoryToken } from 'src/domain/waiting/repositories/waiting-reader.repository.interface'
import { IWaitingWriterRepositoryToken } from 'src/domain/waiting/repositories/waiting-writer.repository.interface'

@Module({
    imports: [TypeOrmModule.forFeature([WaitingUser, ValidToken])],
    controllers: [],
    providers: [
        WaitingSchedulerUseCase,
        {
            provide: IWaitingReaderRepositoryToken,
            useClass: WaitingReaderRepositoryTypeORM,
        },
        {
            provide: IWaitingWriterRepositoryToken,
            useClass: WaitingWriterRepositoryTypeORM,
        },
    ],
    exports: [],
})
export class WaitingModule {}
