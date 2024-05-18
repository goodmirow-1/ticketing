import { Injectable } from '@nestjs/common'
import { KafkaService } from '../../../infrastructure/db/kafka/kafka.service'
import { OnEventSafe } from 'src/domain/common/on-event-safe.decorator'
import { PaymentCompleteSecondEvent } from './payment-complete-second.event'

@Injectable()
export class PaymentCompleteEventSecondListener {
    constructor(private readonly kafkaService: KafkaService) {}

    @OnEventSafe('payment.completed.second')
    async handleReservationCreated(event: PaymentCompleteSecondEvent) {
        const payload = {
            eventId: event.eventId,
            publishing: event.publishing,
            paymentId: event.pointHistory.id,
        }
        await this.kafkaService.sendMessage('payment-completed', payload)
    }
}
