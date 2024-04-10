import { Inject, Injectable } from '@nestjs/common'
import { IUserReaderRepository } from 'src/domain/user/repositories/user-reader.repository.interface'
import { IWaitingReaderRepository } from 'src/domain/waiting/repositories/waiting-reader.repository.interface'
import { IWaitingWriterRepository } from 'src/domain/waiting/repositories/waiting-writer.repository.interface'
import { DataAccessor } from 'src/infrastructure/db/data-accesor.interface'

@Injectable()
export class GenerateTokenUseCase {
    constructor(
        @Inject('IUserReaderRepository')
        private readonly userReaderRepository: IUserReaderRepository,
        @Inject('IWaitingReaderRepository')
        private readonly waitingReaderRepository: IWaitingReaderRepository,
        @Inject('IWaitingWriterRepository')
        private readonly waitingWriterRepository: IWaitingWriterRepository,
        @Inject('DataAccessor')
        private readonly dataAccessor: DataAccessor,
    ) {}

    async excute(userId: string): Promise<string | number> {
        const user = await this.userReaderRepository.findUserById(userId)
        const isValidToken = await this.waitingReaderRepository.isTokenCountUnderThreshold()

        return await this.waitingWriterRepository.createValidTokenOrWaitingUser(user, isValidToken)
    }
}
