import { Controller, Get, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common'

import type { IConcert } from 'src/domain/concert/models/concert.entity.interface'
import type { ISeat } from 'src/domain/concert/models/seat.entity.interface'
import type { IReservation } from 'src/domain/concert/models/reservation.entity.interface'
import { GetUser, JwtAuthGuard } from 'src/domain/common/jwt-token.util'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { ReadWaitingUserUseCase } from '../../application/concert-waiting/usecase/read-waiting-user.usecase'
import { CreateReservationUseCase } from '../../application/concert-waiting/usecase/create-reservation.usecase'
import { ReadAllConcertsUseCase } from '../../application/concert-waiting/usecase/read-all-concerts.usecase'
import { ReadAllSeatsByConcertDateIdUseCase } from '../../application/concert-waiting/usecase/read-all-seats-by-concert-date.usecase'

@ApiTags('콘서트 웨이팅 API')
@Controller('concert-waiting')
export class ConcertWaitingController {
    constructor(
        private readonly createReservationUseCase: CreateReservationUseCase,
        private readonly readAllConcertsUseCase: ReadAllConcertsUseCase,
        private readonly readAllSeatsByConcertDateIdUseCase: ReadAllSeatsByConcertDateIdUseCase,
        private readonly readWaitingUserUseCase: ReadWaitingUserUseCase,
    ) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    @ApiOperation({
        summary: '날짜 조회',
    })
    async readAllConcerts(@GetUser() token: any): Promise<IConcert[]> {
        this.checkWaiting(token.waitingNumber)

        return this.readAllConcertsUseCase.excute()
    }

    @Get(':concertDateId/seats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    @ApiOperation({
        summary: '날짜별 좌석 조회',
    })
    @ApiParam({ name: 'concertDateId', required: true, description: 'concertDateId ID', example: '1be4195c-e170-4d29-9889-9e61f3973684' })
    async readAllSeatsByConcertDateId(@GetUser() token: any, @Param('concertDateId') concertDateId: string): Promise<ISeat[]> {
        this.checkWaiting(token.waitingNumber)

        return this.readAllSeatsByConcertDateIdUseCase.excute(concertDateId)
    }

    @Post(':seatId/reservation')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    @ApiOperation({
        summary: '좌석 예약하기',
    })
    @ApiParam({ name: 'seatId', required: true, description: 'seat ID' })
    async createReservation(@GetUser() token: any, @Param('seatId') seatId: string): Promise<IReservation> {
        this.checkWaiting(token.waitingNumber)

        return this.createReservationUseCase.excute(seatId, token.userId)
    }

    private checkWaiting(waitingNumber: number): void {
        if (waitingNumber) {
            throw new HttpException({ message: 'Please wait', waitingNumber }, HttpStatus.ACCEPTED)
        }
    }
}
