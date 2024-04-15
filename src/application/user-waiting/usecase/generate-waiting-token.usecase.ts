import { Inject, Injectable } from '@nestjs/common'
import { IWaitingReaderRepository, IWaitingReaderRepositoryToken } from '../../../domain/waiting/repositories/waiting-reader.repository.interface'
@Injectable()
export class GenerateWaitingTokenUseCase {
    constructor(
        @Inject(IWaitingReaderRepositoryToken)
        private readonly waitingReaderRepository: IWaitingReaderRepository,
    ) {}

    async excute(userId: string) {
        const isValidToken = await this.waitingReaderRepository.findValidTokenByUserId(userId)
        return await this.waitingReaderRepository.getTokenStatus(userId, isValidToken)
    }
}
