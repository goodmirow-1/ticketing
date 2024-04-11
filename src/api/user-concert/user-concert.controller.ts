import { Controller, Param, Post } from '@nestjs/common'
import { PaymentUserConcertUseCase } from '../../application/user-concert/usecase/payment-user-concert.usecase'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'

@ApiTags('유저 콘서트 API')
@Controller('user-concert')
export class UserConcertController {
    constructor(private readonly paymentUserConcertUseCase: PaymentUserConcertUseCase) {}

    @Post('payment/:reservationId')
    @ApiOperation({
        summary: '결제',
    })
    @ApiParam({ name: 'reservationId', required: true, description: 'reservation ID' })
    async payment(@Param('reservationId') reservationId: string) {
        return this.paymentUserConcertUseCase.excute(reservationId)
    }
}
