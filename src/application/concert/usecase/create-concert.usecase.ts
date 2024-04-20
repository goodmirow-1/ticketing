import { Inject, Injectable } from '@nestjs/common'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from '../../../domain/concert/repositories/concert-writer.repository.interface'
import type { IConcert } from '../../../domain/concert/models/concert.entity.interface'
import { ResponseDTO } from 'src/application/common/response.interface'
import type { IRequestDTO } from 'src/application/common/request.interface'
import type { ApplicationCreateConcertRequestType } from '../dtos/application-create-concert.request.dto'

@Injectable()
export class CreateConcertUseCase {
    constructor(
        @Inject(IConcertWriterRepositoryToken)
        private readonly concertWriterRepository: IConcertWriterRepository,
    ) {}

    async excute(requestDto: IRequestDTO<ApplicationCreateConcertRequestType>): Promise<ResponseDTO<IConcert>> {
        if (!requestDto.validate()) {
            throw new Error('Invalid request data')
        }
        const { singerName } = requestDto.toUseCaseInput()

        const concert = await this.concertWriterRepository.createConcert(singerName)

        return new ResponseDTO<IConcert>(concert)
    }
}
