import { Controller, Get, HttpStatus, Param, Post, Res, UseGuards } from '@nestjs/common'
import { PaymentUserConcertUseCase } from '../../application/user-concert-waiting/usecase/payment-user-concert.usecase'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import type { ICommand } from 'src/application/common/command.interface'
import { PaymentUserConcertCommand } from 'src/application/user-concert-waiting/command/payment-user-concert.command'
import type { PaymentUserConcertResponseDto } from 'src/application/user-concert-waiting/dtos/payment-user-concert.dto'
import { ResponseManager } from '../common/response-manager'
import { Response } from 'express'
import { CreateReservationUseCase } from 'src/application/user-concert-waiting/usecase/create-reservation.usecase'
import { ReadAllConcertsUseCase } from 'src/application/user-concert-waiting/usecase/read-all-concerts.usecase'
import { ReadAllSeatsByConcertDateIdUseCase } from 'src/application/user-concert-waiting/usecase/read-all-seats-by-concert-date.usecase'
import { GetUser, JwtAuthGuard } from '../common/jwt-token.util'
import { ReadAllConcertsCommand } from 'src/application/user-concert-waiting/command/read-all-concerts.command'
import type { ReadAllConcertsResponseDto } from 'src/application/user-concert-waiting/dtos/read-all-concerts.dto'
import type { ReadAllSeatsByConcertResponseDto } from 'src/application/user-concert-waiting/dtos/read-all-seats-by-concert-date.dto'
import { ReadAllSeatsByConcertDateIdCommand } from 'src/application/user-concert-waiting/command/read-all-seats-by-concert-date-id.command'
import type { CreateReservationResponseDto } from 'src/application/user-concert-waiting/dtos/create-reservation.dto'
import { CreateReservationCommand } from 'src/application/user-concert-waiting/command/create-reservation.command'
import { CustomException } from 'src/custom-exception'

@ApiTags('유저 콘서트 API')
@Controller('user-concert')
export class UserConcertWaitingController {
    constructor(
        private readonly paymentUserConcertUseCase: PaymentUserConcertUseCase,
        private readonly createReservationUseCase: CreateReservationUseCase,
        private readonly readAllConcertsUseCase: ReadAllConcertsUseCase,
        private readonly readAllSeatsByConcertDateIdUseCase: ReadAllSeatsByConcertDateIdUseCase,
    ) {}

    @Get('dates')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    @ApiOperation({
        summary: '날짜 조회',
    })
    async readAllConcerts(@GetUser('waitingNumber') waitingNumber: number, @GetUser('userId') userId: string, @Res() response: Response) {
        this.checkWaiting(waitingNumber)

        const command: ICommand<ReadAllConcertsResponseDto> = new ReadAllConcertsCommand(this.readAllConcertsUseCase, userId)
        ResponseManager.from(response, await command.execute())
    }

    @Get(':concertDateId/seats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    @ApiOperation({
        summary: '날짜별 좌석 조회',
    })
    @ApiParam({ name: 'concertDateId', required: true, description: 'concertDateId ID', example: '' })
    async readAllSeatsByConcertDateId(
        @GetUser('waitingNumber') waitingNumber: number,
        @GetUser('userId') userId: string,
        @Param('concertDateId') concertDateId: string,
        @Res() response: Response,
    ) {
        this.checkWaiting(waitingNumber)

        const command: ICommand<ReadAllSeatsByConcertResponseDto> = new ReadAllSeatsByConcertDateIdCommand(
            this.readAllSeatsByConcertDateIdUseCase,
            concertDateId,
            userId,
        )
        ResponseManager.from(response, await command.execute())
    }

    @Post(':seatId/reservation')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    @ApiOperation({
        summary: '좌석 예약하기',
    })
    @ApiParam({ name: 'seatId', required: true, description: 'seat ID' })
    async createReservation(
        @GetUser('waitingNumber') waitingNumber: number,
        @GetUser('userId') userId: string,
        @Param('seatId') seatId: string,
        @Res() response: Response,
    ) {
        this.checkWaiting(waitingNumber)

        const command: ICommand<CreateReservationResponseDto> = new CreateReservationCommand(this.createReservationUseCase, seatId, userId)
        ResponseManager.from(response, await command.execute())
    }

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

    private checkWaiting(waitingNumber: number): void {
        if (waitingNumber) {
            throw new CustomException('Invalid Token', HttpStatus.FORBIDDEN)
        }
    }
}
