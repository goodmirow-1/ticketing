import { Body, Controller, Post } from '@nestjs/common'
import { PaymentUserConcertUseCase } from './usecase/payment-user-concert.usecase'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'

@ApiTags('유저 콘서트 API')
@Controller('user-concert')
export class UserConcertController {
    constructor(private readonly paymentUserConcertUseCase: PaymentUserConcertUseCase) {}

    @Post('payment')
    @ApiOperation({
        summary: '결제',
    })
    @ApiParam({ name: 'reservationId', required: true, description: 'reservation ID' })
    async payment(@Body('reservationId') reservationId: string) {
        return this.paymentUserConcertUseCase.excute(reservationId)
    }
}
