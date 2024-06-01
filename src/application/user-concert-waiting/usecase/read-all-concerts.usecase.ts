import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import type { ReadAllConcertsRequestType } from '../dtos/read-all-concerts.dto'
import { ReadAllConcertsResponseDto } from '../dtos/read-all-concerts.dto'
import type { IRequestDTO } from 'src/application/common/request.interface'
import { IWaitingReaderRepository, IWaitingReaderRepositoryToken } from 'src/domain/user/repositories/waiting-reader.repository.interface'

@Injectable()
export class ReadAllConcertsUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject(IWaitingReaderRepositoryToken)
        private readonly waitingReaderRepository: IWaitingReaderRepository,
    ) {}

    async execute(requestDto: IRequestDTO<ReadAllConcertsRequestType>): Promise<ReadAllConcertsResponseDto> {
        requestDto.validate()

        const { userId } = requestDto.toUseCaseInput()

        //토큰 유효성 조회
        await this.waitingReaderRepository.validateUser(userId)
        //콘서트 목록 조회
        const concerts = await this.concertReaderRepository.findAllConcerts()
        return new ReadAllConcertsResponseDto(concerts)
    }
}
