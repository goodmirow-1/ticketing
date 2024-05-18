import { Inject, Injectable } from '@nestjs/common'
import { OnEventSafe } from 'src/domain/common/on-event-safe.decorator'
import { DataAccessor, DataAccessorToken } from 'src/infrastructure/db/data-accesor.interface'
import { IUserWriterRepository, IUserWriterRepositoryToken } from 'src/domain/user/repositories/user-writer.repository.interface'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PaymentCompleteSecondEvent } from './payment-complete-second.event'
import { PaymentCompleteFirstEvent } from './payment-complete-first.event'

@Injectable()
export class PaymentCompleteFirstEventListener {
    private readonly maxRetries = 3 // 최대 재시도 횟수
    private readonly retryDelay = 1000 // 각 재시도 사이의 지연 시간 (밀리초 단위)

    constructor(
        @Inject(IUserWriterRepositoryToken)
        private readonly userWriterRepository: IUserWriterRepository,
        @Inject(DataAccessorToken)
        private readonly dataAccessor: DataAccessor,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    @OnEventSafe('payment.completed.first')
    async handleReservationCreated(event: PaymentCompleteFirstEvent) {
        await this.executeWithRetry(async session => {
            const pointHistory = await this.userWriterRepository.createPointHistory(event.user, -event.reservation.seat.price, event.reservation.id, session)

            await this.dataAccessor.commitTransaction(session)

            this.eventEmitter.emit('payment.completed.second', new PaymentCompleteSecondEvent(pointHistory))
        })
    }

    private async executeWithRetry(operation: (session: any) => Promise<void>) {
        const session = await this.dataAccessor.getSession()

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                await operation(session)
                return
            } catch (error) {
                if (attempt < this.maxRetries) {
                    console.error(`Attempt ${attempt} failed, retrying in ${this.retryDelay}ms...`)
                    await this.dataAccessor.rollbackTransaction(session)
                    await this.delay(this.retryDelay)
                } else {
                    await this.dataAccessor.rollbackTransaction(session)
                    throw error
                }
            } finally {
                await this.dataAccessor.releaseQueryRunner(session)
            }
        }
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}
