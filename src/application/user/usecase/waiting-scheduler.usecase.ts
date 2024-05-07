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

    @Cron(CronExpression.EVERY_5_SECONDS)
    async handleWaitingUser() {
        const lockKey = 'LOCK_KEY'
        const ttl = 30000 // Lock TTL in milliseconds
        const lockValue = (Date.now() + ttl + 1).toString()
        /*
         * SETNX를 통해 키를 잡은 인스턴스만 실행합니다.
         * 해당 스케줄은 매 시간마다 돌아가고, 실행시간이 10초 내외라서 30초의 ttl을 설정했습니다.
         */
        const lock = await this.waitingReaderRedisRepository.acquireLock(lockKey, lockValue, ttl)
        if (!lock) return

        try {
            //대기열이 비어있지 않을때만 실행
            const count = await this.waitingReaderRedisRepository.getWaitingQueueCount()
            if (count != 0) {
                const dequeueCount = count >= 10 ? 10 : count

                for (let i = 0; i < dequeueCount; ++i) {
                    const userId = await this.waitingWriterRedisRepository.dequeueWaitingUser()
                    if (userId) {
                        await this.waitingWriterRedisRepository.createValidToken(userId)
                    }
                }
            }
        } catch (e) {
            console.log(e)
        } finally {
            await this.waitingReaderRedisRepository.releaseLock(lockKey, lockValue)
        }
    }
}
