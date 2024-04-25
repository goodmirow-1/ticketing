import { Body, Controller, Get, HttpStatus, Param, Post, Res, UseGuards } from '@nestjs/common'
import { CreateConcertUseCase } from '../../application/concert/usecase/create-concert.usecase'
import { CreateConcertDateUseCase } from '../../application/concert/usecase/create-concert-date.usecase'
import { CreateSeatUseCase } from '../../application/concert/usecase/create-seat.usecase'
import { CreateReservationUseCase } from '../../application/concert/usecase/create-reservation.usecase'
import { ReadAllConcertsUseCase } from '../../application/concert/usecase/read-all-concerts.usecase'
import { ReadAllSeatsByConcertDateIdUseCase } from '../../application/concert/usecase/read-all-seats-by-concert-date.usecase'
import { GetUser, JwtAuthGuard } from '../common/jwt-token-util'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
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
import { ResponseManager } from '../common/response-manager'
import { Response } from 'express'
import type { CreateConcertDateResponsetDto } from 'src/application/concert/dtos/create-concert-date.dto'
import type { CreateConcertResponseDto } from 'src/application/concert/dtos/create-concert.dto'
import type { ReadAllConcertsResponseDto } from 'src/application/concert/dtos/read-all-concerts.dto'
import type { ReadAllSeatsByConcertResponseDto } from 'src/application/concert/dtos/read-all-seats-by-concert-date.dto'
import type { CreateSeatResponseDto } from 'src/application/concert/dtos/create-seat.dto'
import type { CreateReservationResponseDto } from 'src/application/concert/dtos/create-reservation.dto'

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
    async readAllConcerts(@GetUser('waitingNumber') waitingNumber: number, @Res() response: Response) {
        this.checkWaiting(waitingNumber)

        const command: ICommand<ReadAllConcertsResponseDto> = new ReadAllConcertsCommand(this.readAllConcertsUseCase)
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
        @Param('concertDateId') concertDateId: string,
        @Res() response: Response,
    ) {
        this.checkWaiting(waitingNumber)

        const command: ICommand<ReadAllSeatsByConcertResponseDto> = new ReadAllSeatsByConcertDateIdCommand(
            this.readAllSeatsByConcertDateIdUseCase,
            concertDateId,
        )
        ResponseManager.from(response, await command.execute())
    }

    @Post()
    @ApiOperation({
        summary: '생성',
    })
    @ApiBody({ schema: { type: 'object', properties: { singerName: { type: 'string', example: '아이유' } } } })
    async createConcert(@Body() createConcertDto: CreateConcertDto, @Res() response: Response) {
        const command: ICommand<CreateConcertResponseDto> = new CreateConcertCommand(this.createConcertUseCase, createConcertDto.singerName)
        ResponseManager.from(response, await command.execute())
    }

    @Post(':concertId/')
    @ApiOperation({
        summary: '날짜 생성',
    })
    @ApiParam({ name: 'concertId', required: true, description: 'concertId ID', example: '' })
    @ApiBody({ schema: { type: 'object', properties: { concertDate: { type: 'date', example: '2024-12-10 11:34:00' } } } })
    async createConcertDate(@Param('concertId') concertId: string, @Body() createConcertDateDto: CreateConcertDateDto, @Res() response: Response) {
        const command: ICommand<CreateConcertDateResponsetDto> = new CreateConcertDateCommand(
            this.createConcertDateUseCase,
            concertId,
            createConcertDateDto.concertDate,
        )
        ResponseManager.from(response, await command.execute())
    }

    @Post(':concertDateId/seat')
    @ApiOperation({
        summary: '좌석 생성',
    })
    @ApiParam({ name: 'concertDateId', required: true, description: 'concertDateId ID', example: '' })
    async createSeat(@Param('concertDateId') concertDateId: string, @Body() createSeatDto: CreateSeatDto, @Res() response: Response) {
        const command: ICommand<CreateSeatResponseDto> = new CreateSeatCommand(
            this.createSeatUseCase,
            concertDateId,
            createSeatDto.seatNumber,
            createSeatDto.price,
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

    private checkWaiting(waitingNumber: number): void {
        if (waitingNumber) {
            throw new CustomException('Invalid Token', HttpStatus.FORBIDDEN)
        }
    }
}
