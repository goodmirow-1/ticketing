import { Inject, Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { IWaitingReaderRepository, IWaitingReaderRepositoryToken } from 'src/domain/user/repositories/waiting-reader.repository.interface'
import { IWaitingWriterRepository, IWaitingWriterRepositoryToken } from 'src/domain/user/repositories/waiting-writer.repository.interface'

@Injectable()
export class WaitingSchedulerUseCase {
    constructor(
        @Inject(IWaitingReaderRepositoryToken)
        private readonly waitingReaderRedisRepository: IWaitingReaderRepository,
        @Inject(IWaitingWriterRepositoryToken)
        private readonly waitingWriterRedisRepository: IWaitingWriterRepository,
    ) {}

    @Cron(CronExpression.EVERY_10_SECONDS)
    async handleWaitingUser() {
        const lockKey = 'LOCK_KEY'
        /*
         * SETNX를 통해 키를 잡은 인스턴스만 실행합니다.
         * 해당 스케줄은 매 10초마다 돌아가고, 실행시간이 5초 내외
         */
        const lock = await this.waitingReaderRedisRepository.acquireLock(lockKey)
        if (!lock) return

        try {
            const userIdList = await this.waitingWriterRedisRepository.dequeueWaitingUserIdList(1000)
            if (userIdList.length != 0) {
                await this.waitingWriterRedisRepository.createValidTokenList(userIdList)
            }
        } catch (e) {
            console.log(e)
        } finally {
            await this.waitingReaderRedisRepository.releaseLock(lock)
        }
    }
}
