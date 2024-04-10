import { Body, Controller, Param, Post } from '@nestjs/common'
import { CreateConcertUseCase } from './usecase/create-concert.usecase'
import { CreateConcertDateUseCase } from './usecase/create-concert-date.usecase'
import { CreateSeatUseCase } from './usecase/create-seat.usecase'
import type { IConcert } from 'src/domain/concert/models/concert.entity.interface'
import type { ISeat } from 'src/domain/concert/models/seat.entity.interface'
import type { IConcertDate } from 'src/domain/concert/models/concertDate.entity.interface'
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'

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
    async createSeat(@Param('concertDateId') concertDateId: string, @Body('seatNumber') seatNumber: number): Promise<ISeat> {
        return this.createSeatUseCase.excute(concertDateId, seatNumber)
    }
}
