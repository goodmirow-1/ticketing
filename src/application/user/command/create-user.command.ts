import type { ICommand } from 'src/application/common/command.interface'
import type { CreateUserUseCase } from '../usecase/create-user.usecase'
import type { CreateUserResponseDto } from '../dtos/create-user.dto'
import { CreateUserRequestDto } from '../dtos/create-user.dto'

export class CreateUserCommand implements ICommand<CreateUserResponseDto> {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly name: string,
    ) {}

    execute(): Promise<CreateUserResponseDto> {
        const requestDto = new CreateUserRequestDto(this.name)

        return this.createUserUseCase.execute(requestDto)
    }
}
