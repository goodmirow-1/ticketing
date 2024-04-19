import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from '../../../domain/concert/repositories/concert-writer.repository.interface'
import type { IConcertDate } from '../../../domain/concert/models/concertDate.entity.interface'

@Injectable()
export class CreateConcertDateUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject(IConcertWriterRepositoryToken)
        private readonly concertWriterRepository: IConcertWriterRepository,
    ) {}

    async excute(concertId: string, date: Date): Promise<IConcertDate> {
        //중복된 날짜가 있는지 확인
        await this.concertReaderRepository.checkValidConcertDateByDate(date)
        //콘서트 조회
        const concert = await this.concertReaderRepository.findConcertById(concertId)
        //콘서트 새로운 날짜 저장
        return await this.concertWriterRepository.createConcertDate(concert, date)
    }
}
