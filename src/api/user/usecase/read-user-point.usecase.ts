import { Inject, Injectable } from '@nestjs/common'
import { IUserReaderRepository } from 'src/domain/user/repositories/user-reader.repository.interface'

@Injectable()
export class ReadUserPointUseCase {
    constructor(
        @Inject('IUserReaderRepository')
        private readonly userReaderRepository: IUserReaderRepository,
    ) {}

    async excute(userId: string): Promise<number> {
        return await this.userReaderRepository.findUserPointById(userId)
    }
}
