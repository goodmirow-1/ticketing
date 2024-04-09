import { Injectable } from '@nestjs/common'
import { IUserReaderRepository } from 'src/domain/user/repositories/user-reader.repository.interface'
import { IUserWriterRepository } from 'src/domain/user/repositories/user-writer.repository.interface'
import { generateAccessToken } from '../../../domain/user/common/jwt-token.util'
import { DataAccessor } from 'src/infrastructure/db/data-accesor.interface'

@Injectable()
export class GenerateTokenUseCase {
    constructor(
        private readonly userReaderRepository: IUserReaderRepository,
        private readonly userWriterRepository: IUserWriterRepository,
        private readonly dataAccessor: DataAccessor,
    ) {}

    async excute(userId: string): Promise<string> {
        const isValidToken = await this.userReaderRepository.isTokenCountUnderThreshold()
        const waitNumber = await this.userReaderRepository.getWaitingUserCount(isValidToken)

        const token = generateAccessToken(userId, waitNumber, 3600 * 1000)
        await this.userWriterRepository.createValidTokenOrWaitingUser(isValidToken, token)

        return token
    }
}
