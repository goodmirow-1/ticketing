import { Inject, Injectable } from '@nestjs/common'
import { IUserReaderRepository, IUserReaderRepositoryToken } from '../../../domain/user/repositories/user-reader.repository.interface'
import type { GenerateTokenRequestType } from '../dtos/generate-token.dto'
import { GenerateTokenResponseDto } from '../dtos/generate-token.dto'
import type { IRequestDTO } from 'src/application/common/request.interface'
import { IWaitingReaderRedisRepository, IWaitingReaderRepositoryRedisToken } from 'src/domain/user/repositories/waiting-reader-redis.repository.interface'
import { IWaitingWriterRedisRepository, IWaitingWriterRepositoryRedisToken } from 'src/domain/user/repositories/waiting-writer-redis.repository.interface'

@Injectable()
export class GenerateTokenUseCase {
    constructor(
        @Inject(IUserReaderRepositoryToken)
        private readonly userReaderRepository: IUserReaderRepository,
        @Inject(IWaitingReaderRepositoryRedisToken)
        private readonly waitingReaderRedisRepository: IWaitingReaderRedisRepository,
        @Inject(IWaitingWriterRepositoryRedisToken)
        private readonly waitingWriterRedisRepository: IWaitingWriterRedisRepository,
    ) {}

    async execute(requestDto: IRequestDTO<GenerateTokenRequestType>): Promise<GenerateTokenResponseDto> {
        requestDto.validate()

        const { userId } = requestDto.toUseCaseInput()

        //사용자 조회
        await this.userReaderRepository.findUserById(userId)
        //유효 토큰에 있는지 확인
        const validToken = await this.waitingReaderRedisRepository.getValidTokenByUserId(userId)
        if (validToken) return new GenerateTokenResponseDto(userId, validToken, 0)
        //대기열에 사용자가 있는지 확인
        const position = await this.waitingReaderRedisRepository.getWaitingNumber(userId)
        //유효 토큰에 등록할 수 있는지 확인
        const isValidToken = await this.waitingReaderRedisRepository.isValidTokenCountUnderThreshold()
        //대기열이 없는지 확인
        const isWaitingQueueEmpty = await this.waitingReaderRedisRepository.isWaitingQueueEmpty()
        //대기열 등록 or 토큰 발급
        const { token, waitingNumber } = await this.waitingWriterRedisRepository.createValidTokenOrWaitingUser(
            userId,
            isWaitingQueueEmpty && isValidToken,
            position,
        )

        return new GenerateTokenResponseDto(userId, token, waitingNumber)
    }
}
