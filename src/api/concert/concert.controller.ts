import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common'
import { CreateConcertUseCase } from './usecase/create-concert.usecase'
import { CreateConcertDateUseCase } from './usecase/create-concert-date.usecase'
import { CreateReservationUseCase } from './usecase/create-reservation.usecase'
import { CreateSeatUseCase } from './usecase/create-seat.usecase'
import { ReadAllConcertsUseCase } from './usecase/read-all-concerts.usecase'
import { ReadAllSeatsByConcertDateIdUseCase } from './usecase/read-all-seats-by-concert-date.usecase'
import type { IConcert } from 'src/domain/concert/models/concert.entity.interface'
import type { ISeat } from 'src/domain/concert/models/seat.entity.interface'
import type { IConcertDate } from 'src/domain/concert/models/concertDate.entity.interface'
import type { IReservation } from 'src/domain/concert/models/reservation.entity.interface'
import { GetUser, JwtAuthGuard } from 'src/domain/common/jwt-token.util'
import { ApiBearerAuth } from '@nestjs/swagger'

@Controller('concert')
export class ConcertController {
    constructor(
        private readonly createConcertUseCase: CreateConcertUseCase,
        private readonly createConcertDateUseCase: CreateConcertDateUseCase,
        private readonly createReservationUseCase: CreateReservationUseCase,
        private readonly createSeatUseCase: CreateSeatUseCase,
        private readonly readAllConcertsUseCase: ReadAllConcertsUseCase,
        private readonly readAllSeatsByConcertDateIdUseCase: ReadAllSeatsByConcertDateIdUseCase,
    ) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    async readAllConcerts(@GetUser('isWaiting') isWaiting: boolean): Promise<IConcert[]> {
        this.checkWaiting(isWaiting)

        return this.readAllConcertsUseCase.excute()
    }

    @Get(':concertDateId/seats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    async readAllSeatsByConcertDateId(@GetUser('isWaiting') isWaiting: boolean, @Param() concertDateId: string): Promise<ISeat[]> {
        this.checkWaiting(isWaiting)

        return this.readAllSeatsByConcertDateIdUseCase.excute(concertDateId)
    }

    @Post()
    async createConcert(@Body() singerName: string): Promise<IConcert> {
        return this.createConcertUseCase.excute(singerName)
    }

    @Post(':concertId/:concertDateId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    async createConcertDate(
        @GetUser('isWaiting') isWaiting: boolean,
        @Param('concertId') concertId: string,
        @Param('concertDateId') concertDate: Date,
    ): Promise<IConcertDate> {
        this.checkWaiting(isWaiting)

        return this.createConcertDateUseCase.excute(concertId, concertDate)
    }

    @Post(':concertDateId/seat')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    async createSeat(@GetUser('isWaiting') isWaiting: boolean, @Param('concertDateId') concertDateId: string, @Body() seatNumber: number): Promise<ISeat> {
        this.checkWaiting(isWaiting)

        return this.createSeatUseCase.excute(concertDateId, seatNumber)
    }

    @Post(':seatId/reservation')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    async createReservation(
        @GetUser('isWaiting') isWaiting: boolean,
        @GetUser('userId') userId: string,
        @Param('seatId') seatId: string,
    ): Promise<IReservation> {
        this.checkWaiting(isWaiting)

        return this.createReservationUseCase.excute(seatId, userId)
    }

    private checkWaiting(isWaiting: boolean): void {
        if (isWaiting) throw new HttpException({ message: 'Please wait', waitNumber: 1 }, HttpStatus.ACCEPTED)
    }
}
