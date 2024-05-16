import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import type { CreateReservationCompleteEvent } from '../../../infrastructure/concert/event/create-reservation-complete.event'

@Injectable()
export class CreateReservationCompleteEventPublisher {
    constructor(private eventEmitter: EventEmitter2) {}

    async publish(event: CreateReservationCompleteEvent) {
        try {
            this.eventEmitter.emit('reservation.created', event)
        } catch (err) {
            console.log(err)
        }
    }
}
