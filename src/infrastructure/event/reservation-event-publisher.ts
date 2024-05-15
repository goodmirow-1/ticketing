import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import type { ReservationCreatedEvent } from '../../domain/common/reservation-created.event'

export const ReservationEventPublisherToken = Symbol.for('IConcertReaderRepository')

@Injectable()
export class ReservationEventPublisher {
    constructor(private eventEmitter: EventEmitter2) {}

    publish(event: ReservationCreatedEvent) {
        this.eventEmitter.emit('reservation.created', event)
    }
}
