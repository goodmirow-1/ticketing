import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards } from '@nestjs/common'
import { CreateConcertUseCase } from '../../application/concert/usecase/create-concert.usecase'
import { CreateConcertDateUseCase } from '../../application/concert/usecase/create-concert-date.usecase'
import { CreateSeatUseCase } from '../../application/concert/usecase/create-seat.usecase'
import type { IConcert } from 'src/domain/concert/models/concert.entity.interface'
import type { ISeat } from 'src/domain/concert/models/seat.entity.interface'
import type { IConcertDate } from 'src/domain/concert/models/concertDate.entity.interface'
import { CreateReservationUseCase } from '../../application/concert/usecase/create-reservation.usecase'
import { ReadAllConcertsUseCase } from '../../application/concert/usecase/read-all-concerts.usecase'
import { ReadAllSeatsByConcertDateIdUseCase } from '../../application/concert/usecase/read-all-seats-by-concert-date.usecase'
import { GetUser, JwtAuthGuard } from '../common/jwt-token-util'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import type { IReservation } from 'src/domain/concert/models/reservation.entity.interface'
import { CustomException } from 'src/custom-exception'
import { CreateConcertDto } from './dtos/create-concert.request.dto'
import { CreateConcertDateDto } from './dtos/create-concert-date.request.dto'
import { CreateSeatDto } from './dtos/create-seat.request.dto'
import { CreateConcertCommand } from '../../application/concert/command/create-concert.command'
import type { ICommand } from '../../application/common/command.interface'
import { ReadAllConcertsCommand } from 'src/application/concert/command/read-all-concerts.command'
import { ReadAllSeatsByConcertDateIdCommand } from 'src/application/concert/command/read-all-seats-by-concert-date-id.command'
import { CreateConcertDateCommand } from 'src/application/concert/command/create-concert-date.command'
import { CreateSeatCommand } from 'src/application/concert/command/create-seat.command'
import { CreateReservationCommand } from 'src/application/concert/command/create-reservation.command'

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

    @Get('dates')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    @ApiOperation({
        summary: '날짜 조회',
    })
    async readAllConcerts(@GetUser('waitingNumber') waitingNumber: number): Promise<IConcert[]> {
        this.checkWaiting(waitingNumber)

        const command: ICommand<IConcert[]> = new ReadAllConcertsCommand(this.readAllConcertsUseCase)
        return command.execute()
    }

    @Get(':concertDateId/seats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token') // 인증 토큰을 위한 Swagger 데코레이터
    @ApiOperation({
        summary: '날짜별 좌석 조회',
    })
    @ApiParam({ name: 'concertDateId', required: true, description: 'concertDateId ID', example: '' })
    async readAllSeatsByConcertDateId(@GetUser('waitingNumber') waitingNumber: number, @Param('concertDateId') concertDateId: string): Promise<ISeat[]> {
        this.checkWaiting(waitingNumber)

        const command: ICommand<ISeat[]> = new ReadAllSeatsByConcertDateIdCommand(this.readAllSeatsByConcertDateIdUseCase, concertDateId)
        return command.execute()
    }

    @Post()
    @ApiOperation({
        summary: '생성',
    })
    @ApiBody({ schema: { type: 'object', properties: { singerName: { type: 'string', example: '아이유' } } } })
    async createConcert(@Body() createConcertDto: CreateConcertDto): Promise<IConcert> {
        const command: ICommand<IConcert> = new CreateConcertCommand(this.createConcertUseCase, createConcertDto.singerName)
        return command.execute()
    }

    @Post(':concertId/')
    @ApiOperation({
        summary: '날짜 생성',
    })
    @ApiParam({ name: 'concertId', required: true, description: 'concertId ID', example: '' })
    @ApiBody({ schema: { type: 'object', properties: { concertDate: { type: 'date', example: '2024-12-10 11:34:00' } } } })
    async createConcertDate(@Param('concertId') concertId: string, @Body() createConcertDateDto: CreateConcertDateDto): Promise<IConcertDate> {
        const command: ICommand<IConcertDate> = new CreateConcertDateCommand(this.createConcertDateUseCase, concertId, createConcertDateDto.concertDate)
        return command.execute()
    }

    @Post(':concertDateId/seat')
    @ApiOperation({
        summary: '좌석 생성',
    })
    @ApiParam({ name: 'concertDateId', required: true, description: 'concertDateId ID', example: '' })
    @ApiBody({ schema: { type: 'object', properties: { seatNumber: { type: 'number', example: 1 } } } })
    @ApiBody({ schema: { type: 'object', properties: { price: { type: 'number', example: 1000 } } } })
    async createSeat(@Param('concertDateId') concertDateId: string, @Body() createSeatDto: CreateSeatDto): Promise<ISeat> {
        const command: ICommand<ISeat> = new CreateSeatCommand(this.createSeatUseCase, concertDateId, createSeatDto.seatNumber, createSeatDto.price)
        return command.execute()
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
    ): Promise<IReservation> {
        this.checkWaiting(waitingNumber)

        const command: ICommand<IReservation> = new CreateReservationCommand(this.createReservationUseCase, seatId, userId)
        return command.execute()
    }

    private checkWaiting(waitingNumber: number): void {
        if (waitingNumber) {
            throw new CustomException('Invalid Token', HttpStatus.FORBIDDEN)
        }
    }
}
