import { Inject, Injectable } from '@nestjs/common'
import { IUserReaderRepository, IUserReaderRepositoryToken } from '../../../domain/user/repositories/user-reader.repository.interface'
import { IWaitingReaderRepository, IWaitingReaderRepositoryToken } from '../../../domain/waiting/repositories/waiting-reader.repository.interface'
import { IWaitingWriterRepository, IWaitingWriterRepositoryToken } from '../../../domain/waiting/repositories/waiting-writer.repository.interface'
import { DataAccessor, DataAccessorToken } from '../../../infrastructure/db/data-accesor.interface'
import { SchedulerState } from 'src/domain/common/schedule-state.instance'

@Injectable()
export class GenerateTokenUseCase {
    private schedulerState = SchedulerState.getInstance()

    constructor(
        @Inject(IUserReaderRepositoryToken)
        private readonly userReaderRepository: IUserReaderRepository,
        @Inject(IWaitingReaderRepositoryToken)
        private readonly waitingReaderRepository: IWaitingReaderRepository,
        @Inject(IWaitingWriterRepositoryToken)
        private readonly waitingWriterRepository: IWaitingWriterRepository,
        @Inject(DataAccessorToken)
        private readonly dataAccessor: DataAccessor,
    ) {}

    async excute(userId: string) {
        await this.userReaderRepository.findUserById(userId)

        //대기열이 활성화되어 있으면 대기열 토큰을 생성합니다.
        if (this.schedulerState.check) {
            return await this.waitingWriterRepository.createWaitingToken(userId)
        } else {
            const session = await this.dataAccessor.getSession('READ COMMITTED')

            try {
                const isValidToken = await this.waitingReaderRepository.isTokenCountUnderThreshold(session, { mode: 'pessimistic_write' })

                const { token, waitingNumber } = await this.waitingWriterRepository.createValidTokenOrWaitingUser(userId, isValidToken, session, {
                    mode: 'pessimistic_write',
                })

                await this.dataAccessor.commitTransaction(session)
                return { token, waitingNumber }
            } catch (error) {
                await this.dataAccessor.rollbackTransaction(session)
                throw error
            } finally {
                await this.dataAccessor.releaseQueryRunner(session)
            }
        }
    }
}
