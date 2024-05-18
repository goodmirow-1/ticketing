import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import type { CreateReservationCompleteEvent } from './create-reservation-complete.event'
import type { PaymentCompleteFirstEvent } from 'src/application/user-concert-waiting/event/payment-complete-first.event'

@Injectable()
export class EventPublisher {
    constructor(private eventEmitter: EventEmitter2) {}

    createReservationCompletepublish(event: CreateReservationCompleteEvent) {
        this.eventEmitter.emit('reservation.created.completed', event)
    }

    paymentCompetePublish(event: PaymentCompleteFirstEvent) {
        this.eventEmitter.emit('payment.completed.first', event)
    }
}
