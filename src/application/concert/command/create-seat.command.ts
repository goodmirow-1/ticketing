import type { ICommand } from 'src/application/common/command.interface'
import type { CreateSeatUseCase } from 'src/application/concert/usecase/create-seat.usecase'
import type { CreateSeatResponseDto } from '../dtos/create-seat.dto'
import { CreateSeatRequestDto } from '../dtos/create-seat.dto'

export class CreateSeatCommand implements ICommand<CreateSeatResponseDto> {
    constructor(
        private readonly createSeatUseCase: CreateSeatUseCase,
        private readonly concertDateId: string,
        private readonly seatNumber: number,
        private readonly price: number,
    ) {}

    execute(): Promise<CreateSeatResponseDto> {
        const requestDto = new CreateSeatRequestDto(this.concertDateId, this.seatNumber, this.price)

        return this.createSeatUseCase.execute(requestDto)
    }
}
