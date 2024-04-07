import { Injectable } from '@nestjs/common'
import { IConcertReaderRepository } from '../repositories/concert-reader.repository.interface'
import { IConcertWriterRepository } from '../repositories/concert-writer.repository.interface'
import { DataAccessor } from 'src/infrastructure/db/data-accesor.interface'
import type { IConcert } from '../../models/concert.entity.interface'
import type { IConcertDate } from '../../models/concertDate.entity.interface'

@Injectable()
export class ConcertService {
    constructor(
        private readonly concertReaderRepository: IConcertReaderRepository,
        private readonly concertWriterRepository: IConcertWriterRepository,
        private readonly dataAccessor: DataAccessor,
    ) {}

    async createConcert(singerName: string): Promise<IConcert> {
        return this.concertWriterRepository.createConcert(singerName)
    }

    async createConcertDate(concertId: string, date: Date): Promise<IConcertDate> {
        const concert = await this.concertReaderRepository.findConcertById(concertId)

        return await this.concertWriterRepository.createConcertDate(concert, date)
    }
}
