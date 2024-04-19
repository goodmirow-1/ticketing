import { Inject, Injectable } from '@nestjs/common'
import { IUserReaderRepository, IUserReaderRepositoryToken } from '../../../domain/user/repositories/user-reader.repository.interface'

@Injectable()
export class ReadUserPointUseCase {
    constructor(
        @Inject(IUserReaderRepositoryToken)
        private readonly userReaderRepository: IUserReaderRepository,
    ) {}

    async excute(userId: string): Promise<number> {
        //유저 포인트 조회
        return await this.userReaderRepository.findUserPointById(userId)
    }
}
