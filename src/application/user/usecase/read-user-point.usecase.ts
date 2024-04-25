import { Inject, Injectable } from '@nestjs/common'
import { IUserReaderRepository, IUserReaderRepositoryToken } from '../../../domain/user/repositories/user-reader.repository.interface'
import type { ReadUserPointRequestType } from '../dtos/read-user-point.dto'
import { ReadUserPointResponseDto } from '../dtos/read-user-point.dto'
import type { IRequestDTO } from 'src/application/common/request.interface'

@Injectable()
export class ReadUserPointUseCase {
    constructor(
        @Inject(IUserReaderRepositoryToken)
        private readonly userReaderRepository: IUserReaderRepository,
    ) {}

    async execute(requestDto: IRequestDTO<ReadUserPointRequestType>): Promise<ReadUserPointResponseDto> {
        requestDto.validate()

        const { userId } = requestDto.toUseCaseInput()
        //유저 포인트 조회
        return new ReadUserPointResponseDto(await this.userReaderRepository.findUserPointById(userId))
    }
}
