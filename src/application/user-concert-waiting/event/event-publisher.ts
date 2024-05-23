import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import type { CreateReservationCompleteEvent } from './create-reservation-complete.event'
import type { PaymentCompleteEvent } from './payment-complete.event'

@Injectable()
export class EventPublisher {
    constructor(private eventEmitter: EventEmitter2) {}

    async createReservationCompletepublish(event: CreateReservationCompleteEvent) {
        this.eventEmitter.emit('reservation.created.completed', event)
    }

    async paymentCompetePublish(event: PaymentCompleteEvent) {
        this.eventEmitter.emit('payment.completed', event)
    }
}
