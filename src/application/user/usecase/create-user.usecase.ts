import { Inject, Injectable } from '@nestjs/common'
import { IUserWriterRepository, IUserWriterRepositoryToken } from '../../../domain/user/repositories/user-writer.repository.interface'
import type { IUser } from '../../../domain/user/models/user.entity.interface'

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject(IUserWriterRepositoryToken)
        private readonly userWriterRepository: IUserWriterRepository,
    ) {}

    async excute(name: string): Promise<IUser> {
        //이름을 토대로 유저 저장
        return await this.userWriterRepository.createUser(name)
    }
}
