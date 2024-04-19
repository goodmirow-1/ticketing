import type { ICommand } from 'src/application/common/command.interface'
import type { ReadAllConcertsUseCase } from 'src/application/concert/usecase/read-all-concerts.usecase'
import type { IConcert } from 'src/domain/concert/models/concert.entity.interface'

export class ReadAllConcertsCommand implements ICommand<IConcert[]> {
    constructor(private readonly readAllConcertsUseCase: ReadAllConcertsUseCase) {}

    execute(): Promise<IConcert[]> {
        return this.readAllConcertsUseCase.excute()
    }
}
