import type { ICommand } from 'src/application/common/command.interface'
import type { ReadAllConcertsUseCase } from 'src/application/user-concert-waiting/usecase/read-all-concerts.usecase'
import { ReadAllConcertsRequestDto, type ReadAllConcertsResponseDto } from '../dtos/read-all-concerts.dto'

export class ReadAllConcertsCommand implements ICommand<ReadAllConcertsResponseDto> {
    constructor(
        private readonly readAllConcertsUseCase: ReadAllConcertsUseCase,
        private readonly userId: string,
    ) {}

    execute(): Promise<ReadAllConcertsResponseDto> {
        const requestDto = new ReadAllConcertsRequestDto(this.userId)

        return this.readAllConcertsUseCase.execute(requestDto)
    }
}
