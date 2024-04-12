import { Inject, Injectable } from '@nestjs/common'
import { IUserReaderRepository, IUserReaderRepositoryToken } from '../../../domain/user/repositories/user-reader.repository.interface'
import { IWaitingReaderRepository, IWaitingReaderRepositoryToken } from '../../../domain/waiting/repositories/waiting-reader.repository.interface'
import { IWaitingWriterRepository, IWaitingWriterRepositoryToken } from '../../../domain/waiting/repositories/waiting-writer.repository.interface'
import { DataAccessor, DataAccessorToken } from '../../../infrastructure/db/data-accesor.interface'

@Injectable()
export class GenerateTokenUseCase {
    constructor(
        @Inject(IUserReaderRepositoryToken)
        private readonly userReaderRepository: IUserReaderRepository,
        @Inject(IWaitingReaderRepositoryToken)
        private readonly waitingReaderRepository: IWaitingReaderRepository,
        @Inject(IWaitingWriterRepositoryToken)
        private readonly waitingWriterRepository: IWaitingWriterRepository,
        @Inject(DataAccessorToken)
        private readonly dataAccessor: DataAccessor,
    ) {}

    async excute(userId: string): Promise<string> {
        await this.userReaderRepository.findUserById(userId)
        const isValidToken = await this.waitingReaderRepository.isTokenCountUnderThreshold()

        return await this.waitingWriterRepository.createValidTokenOrWaitingUser(userId, isValidToken)
    }
}
