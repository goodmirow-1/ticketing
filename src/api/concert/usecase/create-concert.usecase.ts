import { Injectable } from '@nestjs/common'
import { IConcertWriterRepository } from 'src/domain/concert/repositories/concert-writer.repository.interface'
import type { IConcert } from 'src/domain/concert/models/concert.entity.interface'

@Injectable()
export class CreateConcertUseCase {
    constructor(private readonly concertWriterRepository: IConcertWriterRepository) {}

    async excute(singerName: string): Promise<IConcert> {
        return this.concertWriterRepository.createConcert(singerName)
    }
}
