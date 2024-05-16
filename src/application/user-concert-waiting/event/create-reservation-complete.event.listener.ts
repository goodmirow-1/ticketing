import type { OnModuleDestroy } from '@nestjs/common'
import { Inject, Injectable } from '@nestjs/common'
import { CreateReservationCompleteEvent } from './create-reservation-complete.event'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { KafkaService } from '../../../infrastructure/db/kafka/kafka.service'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from 'src/domain/concert/repositories/concert-writer.repository.interface'
import { OnEventSafe } from 'src/domain/common/on-event-safe.decorator'

@Injectable()
export class CreateReservationCompleteEventListener implements OnModuleDestroy {
    constructor(
        @Inject(IConcertWriterRepositoryToken)
        private readonly concertWriterRepository: IConcertWriterRepository,
        private readonly kafkaService: KafkaService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    @OnEventSafe('reservation.created.completed')
    async handleReservationCreated(event: CreateReservationCompleteEvent) {
        try {
            // 좌석 상태 변경
            await this.concertWriterRepository.updateSeatStatus(event.reservation.seat.id, 'reserved', event.session)
            // 사용 가능한 좌석수 차감
            await this.concertWriterRepository.updateConcertDateAvailableSeat(event.reservation.seat.concertDate.id, -1, event.session)

            const payload = {
                eventId: event.eventId,
                publishing: event.publishing,
                reservationId: event.reservation.id,
            }
            await this.kafkaService.sendMessage('reservation-created-completed', payload)
        } catch (error) {
            console.error('Error handling reservation.created.completed event', error)
        }
    }

    onModuleDestroy() {
        // 리스너 해제
        this.eventEmitter.removeAllListeners('reservation.created.completed')
    }
}
