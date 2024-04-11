import { Inject, Injectable } from '@nestjs/common'
import { IWaitingReaderRepository } from 'src/domain/waiting/repositories/waiting-reader.repository.interface'
import { IWaitingWriterRepository } from 'src/domain/waiting/repositories/waiting-writer.repository.interface'

@Injectable()
export class GenerateWaitingTokenUseCase {
    constructor(
        @Inject('IWaitingReaderRepository')
        private readonly waitingReaderRepository: IWaitingReaderRepository,
        @Inject('IWaitingWriterRepository')
        private readonly waitingWriterRepository: IWaitingWriterRepository,
    ) {}

    async excute(token: string): Promise<string | number> {
        const jsonToken = JSON.parse(token)

        const position = await this.waitingReaderRepository.findWaitingUserPosition(jsonToken.userId)
        if (this.waitingReaderRepository.isSameWaitingNumber(position, jsonToken.waitingNumber)) return token

        const isValidToken = await this.waitingReaderRepository.isTokenCountUnderThreshold()

        return isValidToken
            ? await this.waitingWriterRepository.createValidToken(jsonToken.userId)
            : await this.waitingWriterRepository.createWaitingToken(jsonToken.userId)
    }
}
