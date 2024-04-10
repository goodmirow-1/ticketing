import { Inject, Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { SchedulerState } from 'src/domain/common/schedule-state.instance'
import { IWaitingReaderRepository } from 'src/domain/waiting/repositories/waiting-reader.repository.interface'
import { IWaitingWriterRepository } from 'src/domain/waiting/repositories/waiting-writer.repository.interface'

@Injectable()
export class WaitingSchedulerUseCase {
    private schedulerState = SchedulerState.getInstance()

    constructor(
        @Inject('IWaitingReaderRepository')
        private readonly waitingReaderRepository: IWaitingReaderRepository,
        @Inject('IWaitingWriterRepository')
        private readonly waitingWriterRepository: IWaitingWriterRepository,
    ) {}

    @Cron(CronExpression.EVERY_SECOND)
    async handleCron() {
        if (this.schedulerState.check) {
            if (await this.waitingReaderRepository.isTokenCountUnderThreshold()) {
                // WaitingUser 테이블에서 가장 오래된 사용자를 조회합니다.
                const oldestWaitingUsers = await this.waitingReaderRepository.findLastWaitingUser()

                // 만약 대기 중인 사용자가 있으면, ValidToken에 새로운 토큰을 생성하여 삽입합니다.
                if (oldestWaitingUsers.length > 0) {
                    await this.waitingWriterRepository.createValidTokenOrWaitingUser(oldestWaitingUsers[0].user, true)

                    // 처리된 WaitingUser 항목을 삭제합니다.
                    await this.waitingWriterRepository.deleteWaitingUser(oldestWaitingUsers[0].id)
                } else {
                    this.schedulerState.check = false
                }
            }
        }
    }
}
