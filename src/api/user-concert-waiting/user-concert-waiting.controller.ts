import { Body, Controller, Param, Post } from '@nestjs/common'
import { PaymentUserConcertUseCase } from '../../application/user-concert-waiting/usecase/payment-user-concert.usecase'
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'

@ApiTags('유저 콘서트 API')
@Controller('user-concert')
export class UserConcertWaitingController {
    constructor(private readonly paymentUserConcertUseCase: PaymentUserConcertUseCase) {}

    @Post('payment/:reservationId')
    @ApiOperation({
        summary: '결제',
    })
    @ApiParam({ name: 'reservationId', required: true, description: 'reservation ID' })
    @ApiBody({ schema: { type: 'object', properties: { token: { type: 'string', nullable: true, default: '' } } } })
    async payment(@Param('reservationId') reservationId: string, @Body() body: { token?: string }) {
        return this.paymentUserConcertUseCase.excute(reservationId, body.token)
    }
}