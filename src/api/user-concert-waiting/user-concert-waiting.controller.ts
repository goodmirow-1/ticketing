import { Controller, Param, Post, Res } from '@nestjs/common'
import { PaymentUserConcertUseCase } from '../../application/user-concert-waiting/usecase/payment-user-concert.usecase'
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import type { ICommand } from 'src/application/common/command.interface'
import { PaymentUserConcertCommand } from 'src/application/user-concert-waiting/command/payment-user-concert.command'
import type { PaymentUserConcertResponseDto } from 'src/application/user-concert-waiting/dtos/payment-user-concert.dto'
import { ResponseManager } from '../common/response-manager'
import { Response } from 'express'

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
    async payment(@Param('userId') userId: string, @Param('reservationId') reservationId: string, @Res() response: Response) {
        const command: ICommand<PaymentUserConcertResponseDto> = new PaymentUserConcertCommand(this.paymentUserConcertUseCase, userId, reservationId)
        ResponseManager.from(response, await command.execute())
    }
}
