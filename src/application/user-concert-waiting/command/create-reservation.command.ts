import type { ICommand } from 'src/application/common/command.interface'
import type { CreateReservationUseCase } from 'src/application/user-concert-waiting/usecase/create-reservation.usecase'
import type { CreateReservationResponseDto } from '../dtos/create-reservation.dto'
import { CreateReservationRequestDto } from '../dtos/create-reservation.dto'

export class CreateReservationCommand implements ICommand<CreateReservationResponseDto> {
    constructor(
        private readonly createReservationUseCase: CreateReservationUseCase,
        private readonly seatId: string,
        private readonly userId: string,
    ) {}

    execute(): Promise<CreateReservationResponseDto> {
        const requestDto = new CreateReservationRequestDto(this.seatId, this.userId)

        return this.createReservationUseCase.execute(requestDto)
    }
}
