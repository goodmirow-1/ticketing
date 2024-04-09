import { Injectable } from '@nestjs/common'
import { IUserWriterRepository } from 'src/domain/user/repositories/user-writer.repository.interface'
import type { IUser } from 'src/domain/user/models/user.entity.interface'

@Injectable()
export class CreateUserUseCase {
    constructor(private readonly userWriterRepository: IUserWriterRepository) {}

    async excute(name: string): Promise<IUser> {
        return await this.userWriterRepository.createUser(name)
    }
}
