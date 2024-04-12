import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common'
import { CreateConcertUseCase } from '../../application/concert/usecase/create-concert.usecase'
import { CreateConcertDateUseCase } from '../../application/concert/usecase/create-concert-date.usecase'
import { CreateSeatUseCase } from '../../application/concert/usecase/create-seat.usecase'
import type { IConcert } from 'src/domain/concert/models/concert.entity.interface'
import type { ISeat } from 'src/domain/concert/models/seat.entity.interface'
import type { IConcertDate } from 'src/domain/concert/models/concertDate.entity.interface'
import { CreateReservationUseCase } from '../../application/concert-waiting/usecase/create-reservation.usecase'
import { ReadAllConcertsUseCase } from '../../application/concert-waiting/usecase/read-all-concerts.usecase'
import { ReadAllSeatsByConcertDateIdUseCase } from '../../application/concert-waiting/usecase/read-all-seats-by-concert-date.usecase'
import { GetUser, JwtAuthGuard } from 'src/domain/common/jwt-token.util'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import type { IReservation } from 'src/domain/concert/models/reservation.entity.interface'

@ApiTags('콘서트 API')
@Controller('concert')
export class ConcertController {
    constructor(
        private readonly createConcertUseCase: CreateConcertUseCase,
        private readonly createConcertDateUseCase: CreateConcertDateUseCase,
        private readonly createSeatUseCase: CreateSeatUseCase,
        private readonly createReservationUseCase: CreateReservationUseCase,
        private readonly readAllConcertsUseCase: ReadAllConcertsUseCase,
        private readonly readAllSeatsByConcertDateIdUseCase: ReadAllSeatsByConcertDateIdUseCase,
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

    @Post()
    @ApiOperation({
        summary: '생성',
    })
    @ApiBody({ schema: { type: 'object', properties: { singerName: { type: 'string', example: '아이유' } } } })
    async createConcert(@Body('singerName') singerName: string): Promise<IConcert> {
        return this.createConcertUseCase.excute(singerName)
    }

    @Post(':concertId/')
    @ApiOperation({
        summary: '날짜 생성',
    })
    @ApiParam({ name: 'concertId', required: true, description: 'concertId ID', example: '10cb4292-676a-4854-9afc-719b6d03abfe' })
    @ApiBody({ schema: { type: 'object', properties: { concertDate: { type: 'date', example: '2024-12-10 11:34:00' } } } })
    async createConcertDate(@Param('concertId') concertId: string, @Body('concertDate') concertDate: Date): Promise<IConcertDate> {
        console.log(concertDate)
        return this.createConcertDateUseCase.excute(concertId, concertDate)
    }

    @Post(':concertDateId/seat')
    @ApiOperation({
        summary: '좌석 생성',
    })
    @ApiParam({ name: 'concertDateId', required: true, description: 'concertDateId ID', example: '1be4195c-e170-4d29-9889-9e61f3973684' })
    @ApiBody({ schema: { type: 'object', properties: { seatNumber: { type: 'number', example: 1 } } } })
    @ApiBody({ schema: { type: 'object', properties: { price: { type: 'number', example: 1000 } } } })
    async createSeat(@Param('concertDateId') concertDateId: string, @Body('seatNumber') seatNumber: number, @Body('price') price: number): Promise<ISeat> {
        return this.createSeatUseCase.excute(concertDateId, seatNumber, price)
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
