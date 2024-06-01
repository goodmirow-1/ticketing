import { Inject, Injectable } from '@nestjs/common'
import type { GenerateTokenRequestType } from '../dtos/generate-token.dto'
import { GenerateTokenResponseDto } from '../dtos/generate-token.dto'
import type { IRequestDTO } from 'src/application/common/request.interface'
import { IWaitingWriterRepository, IWaitingWriterRepositoryToken } from 'src/domain/user/repositories/waiting-writer.repository.interface'

@Injectable()
export class GenerateTokenUseCase {
    constructor(
        @Inject(IWaitingWriterRepositoryToken)
        private readonly waitingWriterRedisRepository: IWaitingWriterRepository,
    ) {}

    async execute(requestDto: IRequestDTO<GenerateTokenRequestType>): Promise<GenerateTokenResponseDto> {
        requestDto.validate()

        const { userId } = requestDto.toUseCaseInput()
        // 대기열 등록 or 유효 토큰 발급
        const { token, waitingNumber } = await this.waitingWriterRedisRepository.enqueueWaitingUser(userId)

        return new GenerateTokenResponseDto(userId, token, waitingNumber)
    }
}
