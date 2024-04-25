import type { ICommand } from 'src/application/common/command.interface'
import type { CreateConcertUseCase } from 'src/application/concert/usecase/create-concert.usecase'
import type { CreateConcertResponseDto } from '../dtos/create-concert.dto'
import { CreateConcertRequestDto } from '../dtos/create-concert.dto'

export class CreateConcertCommand implements ICommand<CreateConcertResponseDto> {
    constructor(
        private createConcertUseCase: CreateConcertUseCase,
        private singerName: string,
    ) {}

    execute(): Promise<CreateConcertResponseDto> {
        const requestDto = new CreateConcertRequestDto(this.singerName)

        return this.createConcertUseCase.execute(requestDto)
    }
}
