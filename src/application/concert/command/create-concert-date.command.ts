import type { ICommand } from 'src/application/common/command.interface'
import type { CreateConcertDateUseCase } from 'src/application/concert/usecase/create-concert-date.usecase'
import type { CreateConcertDateResponsetDto } from '../dtos/create-concert-date.dto'
import { CreateConcertDateRequestDto } from '../dtos/create-concert-date.dto'

export class CreateConcertDateCommand implements ICommand<CreateConcertDateResponsetDto> {
    constructor(
        private readonly createConcertDateUseCase: CreateConcertDateUseCase,
        private readonly concertId: string,
        private readonly concertDate: Date,
    ) {}

    execute(): Promise<CreateConcertDateResponsetDto> {
        const requestDto = new CreateConcertDateRequestDto(this.concertId, this.concertDate)

        return this.createConcertDateUseCase.execute(requestDto)
    }
}
