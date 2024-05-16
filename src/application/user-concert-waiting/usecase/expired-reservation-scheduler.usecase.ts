import { Inject, Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from 'src/domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from 'src/domain/concert/repositories/concert-writer.repository.interface'
import { DataAccessor, DataAccessorToken } from 'src/infrastructure/db/data-accesor.interface'

@Injectable()
export class ExpiredReservationSchedulerUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject(IConcertWriterRepositoryToken)
        private readonly concertWriterRepository: IConcertWriterRepository,
        @Inject(DataAccessorToken)
        private readonly dataAccessor: DataAccessor,
    ) {}

    @Cron(CronExpression.EVERY_30_SECONDS)
    async handleExpiredReservations() {
        const expiredReservations = await this.concertReaderRepository.findExpiredReservations()

        for (const reservation of expiredReservations) {
            const session = await this.dataAccessor.getSession()
            try {
                await this.concertWriterRepository.updateSeatStatus(reservation.seat.id, 'available', session)
                await this.concertWriterRepository.updateConcertDateAvailableSeat(reservation.concertDate.id, 1, session)
                await this.concertWriterRepository.deleteReservation(reservation.id, session)

                await this.dataAccessor.commitTransaction(session)
            } catch (error) {
                await this.dataAccessor.rollbackTransaction(session)
                console.error(`Failed to handle expired reservation ${reservation.id}:`, error)
            } finally {
                await this.dataAccessor.releaseQueryRunner(session)
            }
        }
    }
}
