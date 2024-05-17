import type { OnModuleDestroy } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { KafkaService } from '../../../infrastructure/db/kafka/kafka.service'
import { OnEventSafe } from 'src/domain/common/on-event-safe.decorator'
import { PaymentCompleteEvent } from './payment-complete.event'

@Injectable()
export class PaymentCompleteEventListener implements OnModuleDestroy {
    constructor(
        private readonly kafkaService: KafkaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    @OnEventSafe('payment.completed')
    async handleReservationCreated(event: PaymentCompleteEvent) {
        const payload = {
            eventId: event.eventId,
            publishing: event.publishing,
            paymentId: event.pointHistory.id,
        }
        await this.kafkaService.sendMessage('payment-completed', payload)
    }

    onModuleDestroy() {
        // 리스너 해제
        this.eventEmitter.removeAllListeners('payment.completed')
    }
}
