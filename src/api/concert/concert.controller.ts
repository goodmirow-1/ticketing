import { Body, Controller, Param, Post, Res } from '@nestjs/common'
import { CreateConcertUseCase } from '../../application/concert/usecase/create-concert.usecase'
import { CreateConcertDateUseCase } from '../../application/concert/usecase/create-concert-date.usecase'
import { CreateSeatUseCase } from '../../application/concert/usecase/create-seat.usecase'
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { CreateConcertDto } from './dtos/create-concert.request.dto'
import { CreateConcertDateDto } from './dtos/create-concert-date.request.dto'
import { CreateSeatDto } from './dtos/create-seat.request.dto'
import { CreateConcertCommand } from '../../application/concert/command/create-concert.command'
import type { ICommand } from '../../application/common/command.interface'
import { CreateConcertDateCommand } from 'src/application/concert/command/create-concert-date.command'
import { ResponseManager } from '../common/response-manager'
import { Response } from 'express'
import type { CreateConcertDateResponsetDto } from 'src/application/concert/dtos/create-concert-date.dto'
import type { CreateConcertResponseDto } from 'src/application/concert/dtos/create-concert.dto'
import type { CreateSeatResponseDto } from 'src/application/concert/dtos/create-seat.dto'
import { CreateSeatCommand } from 'src/application/concert/command/create-seat.command'

@ApiTags('콘서트 API')
@Controller('concert')
export class ConcertController {
    constructor(
        private readonly createConcertUseCase: CreateConcertUseCase,
        private readonly createConcertDateUseCase: CreateConcertDateUseCase,
        private readonly createSeatUseCase: CreateSeatUseCase,
    ) {}

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
}
