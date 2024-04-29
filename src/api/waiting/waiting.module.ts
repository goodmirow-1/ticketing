import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WaitingUser } from '../../infrastructure/waiting/models/waiting-user.entity'
import { ValidToken } from '../../infrastructure/waiting/models/valid-token.entity'
import { WaitingReaderRepositoryTypeORM } from '../../infrastructure/waiting/repositories/waiting-reader.repository'
import { WaitingWriterRepositoryTypeORM } from '../../infrastructure/waiting/repositories/waiting-writer.repository'
import { WaitingSchedulerUseCase } from '../../application/waiting/usecase/waiting-scheduler.usecase'
import { IWaitingReaderRepositoryToken } from '../../domain/waiting/repositories/waiting-reader.repository.interface'
import { IWaitingWriterRepositoryToken } from '../../domain/waiting/repositories/waiting-writer.repository.interface'
import { WaitingScheduler } from '../../infrastructure/waiting/models/waiting-scheduler.entity'

@Module({
    imports: [TypeOrmModule.forFeature([WaitingUser, ValidToken, WaitingScheduler])],
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
