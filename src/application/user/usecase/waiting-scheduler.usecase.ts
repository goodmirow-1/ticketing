import { Inject, Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { IWaitingReaderRedisRepository, IWaitingReaderRepositoryRedisToken } from 'src/domain/user/repositories/waiting-reader-redis.repository.interface'
import { IWaitingWriterRedisRepository, IWaitingWriterRepositoryRedisToken } from 'src/domain/user/repositories/waiting-writer-redis.repository.interface'

@Injectable()
export class WaitingSchedulerUseCase {
    constructor(
        @Inject(IWaitingReaderRepositoryRedisToken)
        private readonly waitingReaderRedisRepository: IWaitingReaderRedisRepository,
        @Inject(IWaitingWriterRepositoryRedisToken)
        private readonly waitingWriterRedisRepository: IWaitingWriterRedisRepository,
    ) {}

    @Cron(CronExpression.EVERY_10_SECONDS)
    async handleWaitingUser() {
        const lockKey = 'LOCK_KEY'
        const ttl = 5000 // Lock TTL in milliseconds
        const lockValue = (Date.now() + ttl + 1).toString()
        /*
         * SETNX를 통해 키를 잡은 인스턴스만 실행합니다.
         * 해당 스케줄은 매 10초마다 돌아가고, 실행시간이 5초 내외
         */
        const lock = await this.waitingReaderRedisRepository.acquireLock(lockKey, lockValue, ttl)
        if (!lock) return

        try {
            const userIdList = await this.waitingWriterRedisRepository.dequeueWaitingUserIdList(1000)
            if (userIdList.length != 0) {
                await this.waitingWriterRedisRepository.createValidTokenList(userIdList)
            }
        } catch (e) {
            console.log(e)
        } finally {
            await this.waitingReaderRedisRepository.releaseLock(lockKey, lockValue)
        }
    }
}
