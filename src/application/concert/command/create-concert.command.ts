import type { ICommand } from 'src/application/common/command.interface'
import type { CreateConcertUseCase } from 'src/application/concert/usecase/create-concert.usecase'

export class CreateConcertCommand implements ICommand {
    constructor(
        private createConcertUseCase: CreateConcertUseCase,
        private singerName: string,
    ) {}

    execute() {
        return this.createConcertUseCase.excute(this.singerName)
    }
}
