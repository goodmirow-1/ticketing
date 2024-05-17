import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import type { PaymentCompleteEvent } from './payment-complete.event'
import type { CreateReservationCompleteEvent } from './create-reservation-complete.event'

@Injectable()
export class EventPublisher {
    constructor(private eventEmitter: EventEmitter2) {}

    createReservationCompletepublish(event: CreateReservationCompleteEvent) {
        this.eventEmitter.emit('reservation.created.completed', event)
    }

    paymentCompetePublish(event: PaymentCompleteEvent) {
        this.eventEmitter.emit('payment.completed', event)
    }
}
