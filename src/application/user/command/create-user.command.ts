import type { ICommand } from 'src/application/common/command.interface'
import type { IUser } from 'src/domain/user/models/user.entity.interface'
import type { CreateUserUseCase } from '../usecase/create-user.usecase'

export class CreateUserCommand implements ICommand<IUser> {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly name: string,
    ) {}

    execute(): Promise<IUser> {
        return this.createUserUseCase.excute(this.name)
    }
}
