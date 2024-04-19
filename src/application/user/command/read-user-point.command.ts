import type { ICommand } from 'src/application/common/command.interface'
import type { ReadUserPointUseCase } from '../usecase/read-user-point.usecase'

export class ReadUserPointCommand implements ICommand<number> {
    constructor(
        private readonly readUserPointUseCase: ReadUserPointUseCase,
        private readonly userId: string,
    ) {}

    execute(): Promise<number> {
        return this.readUserPointUseCase.excute(this.userId)
    }
}
