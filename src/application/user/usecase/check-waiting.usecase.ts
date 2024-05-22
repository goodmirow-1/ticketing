import { Inject, Injectable } from '@nestjs/common'
import type { GenerateTokenRequestType } from '../dtos/generate-token.dto'
import { GenerateTokenResponseDto } from '../dtos/generate-token.dto'
import type { IRequestDTO } from 'src/application/common/request.interface'
import { IWaitingReaderRedisRepository, IWaitingReaderRepositoryRedisToken } from 'src/domain/user/repositories/waiting-reader-redis.repository.interface'

@Injectable()
export class CheckWaitingUseCase {
    constructor(
        @Inject(IWaitingReaderRepositoryRedisToken)
        private readonly waitingReaderRedisRepository: IWaitingReaderRedisRepository,
    ) {}

    async execute(requestDto: IRequestDTO<GenerateTokenRequestType>): Promise<GenerateTokenResponseDto> {
        requestDto.validate()

        const { userId } = requestDto.toUseCaseInput()

        const responseDto = new GenerateTokenResponseDto(userId, null, -1)

        // 유효 토큰에 있는지 확인
        const validToken = await this.waitingReaderRedisRepository.getValidTokenByUserId(userId)
        if (validToken) {
            responseDto.token = validToken
            responseDto.waitingNumber = 0
        } else {
            responseDto.waitingNumber = await this.waitingReaderRedisRepository.getWaitingNumber(userId)
        }

        return responseDto
    }
}
