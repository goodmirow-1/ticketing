import type { ICommand } from 'src/application/common/command.interface'
import type { CreateConcertUseCase } from 'src/application/concert/usecase/create-concert.usecase'
import { ApplicationCreateConcertRequestDto } from '../dtos/application-create-concert.request.dto'

export class CreateConcertCommand implements ICommand {
    constructor(
        private createConcertUseCase: CreateConcertUseCase,
        private singerName: string,
    ) {}

    execute() {
        const requestDto = new ApplicationCreateConcertRequestDto(this.singerName)

        return this.createConcertUseCase.excute(requestDto)
    }
}