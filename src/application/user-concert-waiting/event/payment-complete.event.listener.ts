import { Injectable } from '@nestjs/common'
import { OnEventSafe } from 'src/domain/common/on-event-safe.decorator'
import { PaymentCompleteEvent } from './payment-complete.event'
import { KafkaService } from 'src/infrastructure/db/kafka/kafka.service'

@Injectable()
export class PaymentCompleteEventListener {
    constructor(private readonly kafkaService: KafkaService) {}

    @OnEventSafe('payment.completed')
    async handleEvent(event: PaymentCompleteEvent) {
        const payload = {
            eventId: event.eventId,
            publishing: event.publishing,
            userId: event.user.id,
            reservationId: event.reservation.id,
        }
        await this.kafkaService.sendMessage('payment-completed', payload)
    }
}
