import type { ICommand } from 'src/application/common/command.interface'
import type { IPointHistory } from 'src/domain/user/models/point-history.entity.interface'
import type { PaymentUserConcertUseCase } from '../usecase/payment-user-concert.usecase'

export class PaymentUserConcertCommand implements ICommand<IPointHistory> {
    // Specify the type if known
    constructor(
        private readonly paymentUserConcertUseCase: PaymentUserConcertUseCase,
        private readonly userId: string,
        private readonly reservationId: string,
        private readonly token: string,
    ) {}

    execute(): Promise<IPointHistory> {
        // Specify the return type if known
        return this.paymentUserConcertUseCase.excute(this.userId, this.reservationId, this.token)
    }
}
