import { Body, Controller, Post } from '@nestjs/common'
import { PaymentUserConcertUseCase } from './usecase/payment-user-concert.usecase'

@Controller('user-concert')
export class UserConcertController {
    constructor(private readonly paymentUserConcertUseCase: PaymentUserConcertUseCase) {}

    @Post('payment')
    async payment(@Body('reservationId') reservationId: string) {
        return this.paymentUserConcertUseCase.excute(reservationId)
    }
}
