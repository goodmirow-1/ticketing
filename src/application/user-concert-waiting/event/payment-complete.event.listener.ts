import type { OnModuleDestroy } from '@nestjs/common'
import { Inject, Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { KafkaService } from '../../../infrastructure/db/kafka/kafka.service'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from 'src/domain/concert/repositories/concert-writer.repository.interface'
import { OnEventSafe } from 'src/domain/common/on-event-safe.decorator'
import { PaymentCompleteEvent } from './payment-complete.event'
import { IUserWriterRepository, IUserWriterRepositoryToken } from 'src/domain/user/repositories/user-writer.repository.interface'

@Injectable()
export class PaymentCompleteEventListener implements OnModuleDestroy {
    constructor(
        @Inject(IConcertWriterRepositoryToken)
        private readonly concertWriterRepository: IConcertWriterRepository,
        @Inject(IUserWriterRepositoryToken)
        private readonly userWriterRepository: IUserWriterRepository,
        private readonly kafkaService: KafkaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    @OnEventSafe('payment.completed')
    async handleReservationCreated(event: PaymentCompleteEvent) {
        try {
            //결제 로그 저장
            const pointHistory = await this.userWriterRepository.createPointHistory(
                event.user,
                -event.reservation.seat.price,
                event.reservation.id,
                event.session,
            )
            //좌석 상태 변경
            await this.concertWriterRepository.updateSeatStatus(event.reservation.seat.id, 'held', event.session)

            await this.concertWriterRepository.updateReservationPaymentCompleted(event.reservation.id, event.session)

            const payload = {
                eventId: event.eventId,
                publishing: event.publishing,
                paymentId: pointHistory.id,
            }
            await this.kafkaService.sendMessage('payment-completed', payload)
        } catch (error) {
            console.error('Error handling payment.completed event', error)
        }
    }

    onModuleDestroy() {
        // 리스너 해제
        this.eventEmitter.removeAllListeners('payment.completed')
    }
}
