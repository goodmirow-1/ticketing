import { Injectable } from '@nestjs/common'
import { IUserReaderRepository } from '../repositories/user-reader.repository.interface'
import { IUserWriterRepository } from '../repositories/user-writer.repository.interface'
import { DataAccessor } from 'src/infrastructure/db/data-accesor.interface'
import { generateAccessToken } from '../../common/jwt-token.util'

@Injectable()
export class UserService {
    constructor(
        private readonly userReaderRepository: IUserReaderRepository,
        private readonly userWriterRepository: IUserWriterRepository,
        private readonly dataAccessor: DataAccessor,
    ) {}

    async generateToken(userId: string): Promise<string> {
        const isValidToken = await this.userReaderRepository.isTokenCountUnderThreshold()
        const waitNumber = await this.userReaderRepository.getWaitingUserCount(isValidToken)

        const token = generateAccessToken(userId, waitNumber, 3600 * 1000)
        await this.userWriterRepository.createValidTokenOrWaitingUser(isValidToken, token)

        return token
    }
}
