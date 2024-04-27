import { Inject, Injectable } from '@nestjs/common'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from '../../../domain/concert/repositories/concert-writer.repository.interface'
import type { IRequestDTO } from 'src/application/common/request.interface'
import { CreateConcertResponseDto, type CreateConcertRequestType } from '../dtos/create-concert.dto'

@Injectable()
export class CreateConcertUseCase {
    constructor(
        @Inject(IConcertWriterRepositoryToken)
        private readonly concertWriterRepository: IConcertWriterRepository,
    ) {}

    async execute(requestDto: IRequestDTO<CreateConcertRequestType>) {
        requestDto.validate()

        const { singerName } = requestDto.toUseCaseInput()

        const concert = await this.concertWriterRepository.createConcert(singerName)

        return new CreateConcertResponseDto(concert.id, concert.singerName)
    }
}
