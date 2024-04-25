import { Inject, Injectable } from '@nestjs/common'
import { IUserWriterRepository, IUserWriterRepositoryToken } from '../../../domain/user/repositories/user-writer.repository.interface'
import type { CreateUserRequestType } from '../dtos/create-user.dto'
import { CreateUserResponseDto } from '../dtos/create-user.dto'
import type { IRequestDTO } from 'src/application/common/request.interface'

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject(IUserWriterRepositoryToken)
        private readonly userWriterRepository: IUserWriterRepository,
    ) {}

    async execute(requestDto: IRequestDTO<CreateUserRequestType>): Promise<CreateUserResponseDto> {
        requestDto.validate()

        const { name } = requestDto.toUseCaseInput()

        //이름을 토대로 유저 저장
        const user = await this.userWriterRepository.createUser(name)
        return new CreateUserResponseDto(user.id, user.name)
    }
}
