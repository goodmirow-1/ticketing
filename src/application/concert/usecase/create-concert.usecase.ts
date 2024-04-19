import { Inject, Injectable } from '@nestjs/common'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from '../../../domain/concert/repositories/concert-writer.repository.interface'
import type { IConcert } from '../../../domain/concert/models/concert.entity.interface'

@Injectable()
export class CreateConcertUseCase {
    constructor(
        @Inject(IConcertWriterRepositoryToken)
        private readonly concertWriterRepository: IConcertWriterRepository,
    ) {}

    async excute(singerName: string): Promise<IConcert> {
        //가수 이름으로 콘서트 저장
        return this.concertWriterRepository.createConcert(singerName)
    }
}
