import { Injectable } from '@nestjs/common'
import { ReservationCreatedEvent } from '../../domain/common/reservation-created.event'
import { OnEvent } from '@nestjs/event-emitter'
import { KafkaService } from '../db/kafka/kafka.service'

@Injectable()
export class ReservationEventListener {
    constructor(private readonly kafkaService: KafkaService) {}

    @OnEvent('reservation.created')
    async handleReservationCreated(event: ReservationCreatedEvent) {
        const payload = {
            eventId: event.eventId,
            publishing: event.publishing,
            reservationId: event.reservation.id,
        }
        await this.kafkaService.sendMessage('reservation-created', payload)
    }
}
