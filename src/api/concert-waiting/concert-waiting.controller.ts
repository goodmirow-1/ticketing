import { Controller, Get, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common'

import type { IConcert } from 'src/domain/concert/models/concert.entity.interface'
import type { ISeat } from 'src/domain/concert/models/seat.entity.interface'
import type { IReservation } from 'src/domain/concert/models/reservation.entity.interface'
import { GetUser, JwtAuthGuard } from 'src/domain/common/jwt-token.util'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { ReadWaitingUserUseCase } from './usecase/read-waiting-user.usecase'
import { CreateReservationUseCase } from './usecase/create-reservation.usecase'
import { ReadAllConcertsUseCase } from './usecase/read-all-concerts.usecase'
import { ReadAllSeatsByConcertDateIdUseCase } from './usecase/read-all-seats-by-concert-date.usecase'

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
    async readAllConcerts(@GetUser('isWaiting') isWaiting: boolean, @GetUser('userId') userId: string): Promise<IConcert[]> {
        this.checkWaiting(userId, isWaiting)

        return this.readAllConcertsUseCase.excute()
    }

    @Get(':concertDateId/seats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    @ApiOperation({
        summary: '날짜별 좌석 조회',
    })
    @ApiParam({ name: 'concertDateId', required: true, description: 'concertDateId ID' })
    async readAllSeatsByConcertDateId(
        @GetUser('isWaiting') isWaiting: boolean,
        @GetUser('userId') userId: string,
        @Param('concertDateId') concertDateId: string,
    ): Promise<ISeat[]> {
        this.checkWaiting(userId, isWaiting)

        return this.readAllSeatsByConcertDateIdUseCase.excute(concertDateId)
    }

    @Post(':seatId/reservation')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    @ApiOperation({
        summary: '좌석 예약하기',
    })
    @ApiParam({ name: 'seatId', required: true, description: 'seat ID' })
    async createReservation(
        @GetUser('isWaiting') isWaiting: boolean,
        @GetUser('userId') userId: string,
        @Param('seatId') seatId: string,
    ): Promise<IReservation> {
        this.checkWaiting(userId, isWaiting)

        return this.createReservationUseCase.excute(seatId, userId)
    }

    private checkWaiting(userId, isWaiting: boolean): void {
        if (isWaiting) {
            const waitNumber = this.readWaitingUserUseCase.excute(userId)

            throw new HttpException({ message: 'Please wait', waitNumber }, HttpStatus.ACCEPTED)
        }
    }
}
