import type { ICommand } from 'src/application/common/command.interface'
import type { ReadAllConcertsUseCase } from 'src/application/concert/usecase/read-all-concerts.usecase'
import type { ReadAllConcertsResponseDto } from '../dtos/read-all-concerts.dto'

export class ReadAllConcertsCommand implements ICommand<ReadAllConcertsResponseDto> {
    constructor(private readonly readAllConcertsUseCase: ReadAllConcertsUseCase) {}

    execute(): Promise<ReadAllConcertsResponseDto> {
        return this.readAllConcertsUseCase.execute()
    }
}
