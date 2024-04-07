import { Inject, Injectable } from '@nestjs/common'
import type { IConcertReaderRepository } from 'src/domain/concert/business/repositories/concert-reader.repository.interface'
import { EntityManager } from 'typeorm'
import { Concert } from '../models/concert.entity'
import { Seat } from '../models/seat.entity'
import { ConcertDate } from '../models/concertDate.entity'
import { NotFoundConcertError } from 'src/domain/concert/business/exceptions/not-found-concert.exception'

@Injectable()
export class ConcertReaderRepository implements IConcertReaderRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

    async findConcertById(id: string): Promise<Concert> {
        const concert = await this.entityManager.findOne(Concert, { where: { id }, relations: ['concertDates'] })

        if (!concert) throw new NotFoundConcertError(`Concert id ${id} not found`)

        return concert
    }

    async findAllConcertsByDate(): Promise<Concert[]> {
        return this.entityManager.find(Concert, { relations: ['concertDates'] })
    }

    async findSeatsByConcertDate(concertDateId: string): Promise<Seat[]> {
        const concertDate = await this.entityManager.findOne(ConcertDate, { where: { id: concertDateId } })

        return this.entityManager.find(Seat, { where: { concertDate } })
    }
}
