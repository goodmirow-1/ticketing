import type { ICommand } from 'src/application/common/command.interface'
import type { CreateReservationUseCase } from 'src/application/concert/usecase/create-reservation.usecase'
import type { IReservation } from 'src/domain/concert/models/reservation.entity.interface'

export class CreateReservationCommand implements ICommand<IReservation> {
    constructor(
        private readonly createReservationUseCase: CreateReservationUseCase,
        private readonly seatId: string,
        private readonly userId: string,
    ) {}

    execute(): Promise<IReservation> {
        return this.createReservationUseCase.excute(this.seatId, this.userId)
    }
}
