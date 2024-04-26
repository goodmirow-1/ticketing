import { Inject, Injectable } from '@nestjs/common'
import { IWaitingReaderRepository, IWaitingReaderRepositoryToken } from '../../../domain/waiting/repositories/waiting-reader.repository.interface'
import type { GenerateWaitingTokenRequestType } from '../dtos/generate.waiting-token.dto'
import { GenerateWaitingTokenResponseDto } from '../dtos/generate.waiting-token.dto'
import type { IRequestDTO } from 'src/application/common/request.interface'
@Injectable()
export class GenerateWaitingTokenUseCase {
    constructor(
        @Inject(IWaitingReaderRepositoryToken)
        private readonly waitingReaderRepository: IWaitingReaderRepository,
    ) {}

    async execute(requestDto: IRequestDTO<GenerateWaitingTokenRequestType>): Promise<GenerateWaitingTokenResponseDto> {
        requestDto.validate()

        const { userId } = requestDto.toUseCaseInput()

        //사용자가 유효토큰에 있는지 대기 토큰에 있는지 확인
        const isValidToken = await this.waitingReaderRepository.findValidTokenByUserId(userId)
        //유효토큰에 있으면 발급된 유효토큰 반환, 대기토큰에 있으면 대기순서 반환
        const { token, waitingNumber } = await this.waitingReaderRepository.getTokenStatus(userId, isValidToken)
        return new GenerateWaitingTokenResponseDto(token, waitingNumber * 1)
    }
}
