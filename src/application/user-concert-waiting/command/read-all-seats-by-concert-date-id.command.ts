import type { ICommand } from 'src/application/common/command.interface'
import type { ReadAllSeatsByConcertDateIdUseCase } from 'src/application/user-concert-waiting/usecase/read-all-seats-by-concert-date.usecase'
import type { ReadAllSeatsByConcertResponseDto } from '../dtos/read-all-seats-by-concert-date.dto'
import { ReadAllSeatsByConcertRequestDto } from '../dtos/read-all-seats-by-concert-date.dto'

export class ReadAllSeatsByConcertDateIdCommand implements ICommand<ReadAllSeatsByConcertResponseDto> {
    constructor(
        private readonly readAllSeatsByConcertDateIdUseCase: ReadAllSeatsByConcertDateIdUseCase,
        private readonly concertDateId: string,
        private readonly userId: string,
    ) {}

    execute(): Promise<ReadAllSeatsByConcertResponseDto> {
        const requestDto = new ReadAllSeatsByConcertRequestDto(this.concertDateId, this.userId)

        return this.readAllSeatsByConcertDateIdUseCase.execute(requestDto)
    }
}
