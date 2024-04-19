import type { ICommand } from 'src/application/common/command.interface'
import type { CreateConcertDateUseCase } from 'src/application/concert/usecase/create-concert-date.usecase'
import type { IConcertDate } from 'src/domain/concert/models/concertDate.entity.interface'

export class CreateConcertDateCommand implements ICommand<IConcertDate> {
    constructor(
        private readonly createConcertDateUseCase: CreateConcertDateUseCase,
        private readonly concertId: string,
        private readonly concertDate: Date,
    ) {}

    execute(): Promise<IConcertDate> {
        return this.createConcertDateUseCase.excute(this.concertId, this.concertDate)
    }
}
