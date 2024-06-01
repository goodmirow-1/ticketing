import { Inject, Injectable } from '@nestjs/common'
import type { IRequestDTO } from 'src/application/common/request.interface'
import { IWaitingReaderRepository, IWaitingReaderRepositoryToken } from 'src/domain/user/repositories/waiting-reader.repository.interface'
import type { CheckWaitingRequestType } from '../dtos/check-waiting.dto'
import { CheckWaitingResponseDto } from '../dtos/check-waiting.dto'

@Injectable()
export class CheckWaitingUseCase {
    constructor(
        @Inject(IWaitingReaderRepositoryToken)
        private readonly waitingReaderRedisRepository: IWaitingReaderRepository,
    ) {}

    async execute(requestDto: IRequestDTO<CheckWaitingRequestType>): Promise<CheckWaitingResponseDto> {
        requestDto.validate()

        const { userId, waitingCount } = requestDto.toUseCaseInput()

        const responseDto = new CheckWaitingResponseDto(userId, null, -1)

        // 유효 토큰에 있는지 확인
        const validToken = await this.waitingReaderRedisRepository.getValidTokenByUserId(userId)
        if (validToken) {
            responseDto.token = validToken
            responseDto.waitingNumber = 0
        } else {
            responseDto.waitingNumber = await this.waitingReaderRedisRepository.getWaitingNumber(userId, waitingCount)
        }

        return responseDto
    }
}
