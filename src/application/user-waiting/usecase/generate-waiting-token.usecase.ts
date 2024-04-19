import { Inject, Injectable } from '@nestjs/common'
import { IWaitingReaderRepository, IWaitingReaderRepositoryToken } from '../../../domain/waiting/repositories/waiting-reader.repository.interface'
@Injectable()
export class GenerateWaitingTokenUseCase {
    constructor(
        @Inject(IWaitingReaderRepositoryToken)
        private readonly waitingReaderRepository: IWaitingReaderRepository,
    ) {}

    async excute(userId: string) {
        //사용자가 유효토큰에 있는지 대기 토큰에 있는지 확인
        const isValidToken = await this.waitingReaderRepository.findValidTokenByUserId(userId)
        //유효토큰에 있으면 발급된 유효토큰 반환, 대기토큰에 있으면 대기순서 반환
        return await this.waitingReaderRepository.getTokenStatus(userId, isValidToken)
    }
}
