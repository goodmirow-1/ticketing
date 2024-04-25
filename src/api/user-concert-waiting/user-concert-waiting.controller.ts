import { Body, Controller, Param, Post } from '@nestjs/common'
import { PaymentUserConcertUseCase } from '../../application/user-concert-waiting/usecase/payment-user-concert.usecase'
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { PaymentDto } from './dtos/payment.request.dto'
import type { ICommand } from 'src/application/common/command.interface'
import type { IPointHistory } from 'src/domain/user/models/point-history.entity.interface'
import { PaymentUserConcertCommand } from 'src/application/user-concert-waiting/command/payment-user-concert.command'

@ApiTags('유저 콘서트 API')
@Controller('user-concert')
export class UserConcertWaitingController {
    constructor(private readonly paymentUserConcertUseCase: PaymentUserConcertUseCase) {}

    
    @Post('payment/:userId/:reservationId')
    @ApiOperation({
        summary: '결제',
    })
    @ApiParam({ name: 'userId', required: true, description: 'user ID' })
    @ApiParam({ name: 'reservationId', required: true, description: 'reservation ID' })
    @ApiBody({ schema: { type: 'object', properties: { token: { type: 'string', nullable: true, default: '' } } } })
    async payment(@Param('userId') userId: string, @Param('reservationId') reservationId: string, @Body() paymentDto: PaymentDto) {
        const command: ICommand<IPointHistory> = new PaymentUserConcertCommand(this.paymentUserConcertUseCase, userId, reservationId, paymentDto.token)
        return command.execute()
    }
}
