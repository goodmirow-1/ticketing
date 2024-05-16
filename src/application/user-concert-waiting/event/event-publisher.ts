import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import type { PaymentCompleteEvent } from './payment-complete.event'
import type { CreateReservationCompleteEvent } from './create-reservation-complete.event'

@Injectable()
export class EventPublisher {
    constructor(private eventEmitter: EventEmitter2) {}

    createReservationCompletepublish(event: CreateReservationCompleteEvent) {
        try {
            this.eventEmitter.emit('reservation.created.completed', event)
        } catch (err) {
            console.log(err)
        }
    }

    async paymentCompetePublish(event: PaymentCompleteEvent) {
        try {
            await this.eventEmitter.emitAsync('payment.completed', event)
        } catch (err) {
            console.log(err)
        }
    }
}
