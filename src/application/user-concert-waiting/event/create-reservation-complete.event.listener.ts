import type { OnModuleDestroy } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { CreateReservationCompleteEvent } from './create-reservation-complete.event'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { KafkaService } from '../../../infrastructure/db/kafka/kafka.service'
import { OnEventSafe } from 'src/domain/common/on-event-safe.decorator'

@Injectable()
export class CreateReservationCompleteEventListener implements OnModuleDestroy {
    constructor(
        private readonly kafkaService: KafkaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    @OnEventSafe('reservation.created.completed')
    async handleReservationCreated(event: CreateReservationCompleteEvent) {
        const payload = {
            eventId: event.eventId,
            publishing: event.publishing,
            reservationId: event.reservation.id,
        }
        await this.kafkaService.sendMessage('reservation-created-completed', payload)
    }

    onModuleDestroy() {
        // 리스너 해제
        this.eventEmitter.removeAllListeners('reservation.created.completed')
    }
}
