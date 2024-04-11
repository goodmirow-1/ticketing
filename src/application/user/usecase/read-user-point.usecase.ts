import { Inject, Injectable } from '@nestjs/common'
import { IUserReaderRepository, IUserReaderRepositoryToken } from '../../../domain/user/repositories/user-reader.repository.interface'

@Injectable()
export class ReadUserPointUseCase {
    constructor(
        @Inject(IUserReaderRepositoryToken)
        private readonly userReaderRepository: IUserReaderRepository,
    ) {}

    async excute(userId: string): Promise<number> {
        return await this.userReaderRepository.findUserPointById(userId)
    }
}
