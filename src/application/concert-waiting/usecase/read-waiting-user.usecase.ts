import { Inject } from '@nestjs/common'
import { IWaitingReaderRepository } from 'src/domain/waiting/repositories/waiting-reader.repository.interface'

export class ReadWaitingUserUseCase {
    constructor(
        @Inject('IWaitingReaderRepository')
        private readonly waitingUserReaderRepository: IWaitingReaderRepository,
    ) {}

    async excute(userId: string) {
        return await this.waitingUserReaderRepository.findWaitingUserPosition(userId)
    }
}
