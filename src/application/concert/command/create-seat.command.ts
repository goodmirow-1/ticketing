import type { ICommand } from 'src/application/common/command.interface'
import type { CreateSeatUseCase } from 'src/application/concert/usecase/create-seat.usecase'
import type { ISeat } from 'src/domain/concert/models/seat.entity.interface'

export class CreateSeatCommand implements ICommand<ISeat> {
    constructor(
        private readonly createSeatUseCase: CreateSeatUseCase,
        private readonly concertDateId: string,
        private readonly seatNumber: number,
        private readonly price: number,
    ) {}

    execute(): Promise<ISeat> {
        return this.createSeatUseCase.excute(this.concertDateId, this.seatNumber, this.price)
    }
}
