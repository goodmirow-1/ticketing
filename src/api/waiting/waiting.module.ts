import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WaitingUser } from 'src/infrastructure/waiting/models/waiting-user.entity'
import { ValidToken } from 'src/infrastructure/waiting/models/valid-token.entity'
import { WaitingReaderRepositoryTypeORM } from 'src/infrastructure/waiting/repositories/waiting-reader.repository'
import { WaitingWriterRepositoryTypeORM } from 'src/infrastructure/waiting/repositories/waiting-writer.repository'
import { WaitingSchedulerUseCase } from '../../application/waiting/usecase/waiting-scheduler.usecase'

@Module({
    imports: [TypeOrmModule.forFeature([WaitingUser, ValidToken])],
    controllers: [],
    providers: [
        WaitingSchedulerUseCase,
        {
            provide: 'IWaitingReaderRepository',
            useClass: WaitingReaderRepositoryTypeORM,
        },
        {
            provide: 'IWaitingWriterRepository',
            useClass: WaitingWriterRepositoryTypeORM,
        },
    ],
    exports: [],
})
export class WaitingModule {}
