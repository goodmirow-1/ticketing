import type { ICommand } from 'src/application/common/command.interface'
import type { PaymentUserConcertUseCase } from '../usecase/payment-user-concert.usecase'
import type { PaymentUserConcertResponseDto } from '../dtos/payment-user-concert.dto'
import { PaymentUserConcertRequestDto } from '../dtos/payment-user-concert.dto'

export class PaymentUserConcertCommand implements ICommand<PaymentUserConcertResponseDto> {
    // Specify the type if known
    constructor(
        private readonly paymentUserConcertUseCase: PaymentUserConcertUseCase,
        private readonly userId: string,
        private readonly reservationId: string,
    ) {}

    execute(): Promise<PaymentUserConcertResponseDto> {
        const requestDto = new PaymentUserConcertRequestDto(this.userId, this.reservationId)
        // Specify the return type if known
        return this.paymentUserConcertUseCase.execute(requestDto)
    }
}
