import type { ICommand } from 'src/application/common/command.interface'
import type { ReadAllSeatsByConcertDateIdUseCase } from 'src/application/concert/usecase/read-all-seats-by-concert-date.usecase'
import type { ISeat } from 'src/domain/concert/models/seat.entity.interface'

export class ReadAllSeatsByConcertDateIdCommand implements ICommand<ISeat[]> {
    constructor(
        private readonly readAllSeatsByConcertDateIdUseCase: ReadAllSeatsByConcertDateIdUseCase,
        private readonly concertDateId: string,
    ) {}

    execute(): Promise<ISeat[]> {
        return this.readAllSeatsByConcertDateIdUseCase.excute(this.concertDateId)
    }
}
