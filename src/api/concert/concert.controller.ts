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
    @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', example: '아이유' } } } })
    async createConcert(@Body() singerName: string): Promise<IConcert> {
        return this.createConcertUseCase.excute(singerName)
    }

    @Post(':concertId/:concertDateId')
    @ApiOperation({
        summary: '날짜 생성',
    })
    @ApiParam({ name: 'concertId', required: true, description: 'concertId ID' })
    @ApiParam({ name: 'concertDateId', required: true, description: 'concertDateId ID' })
    async createConcertDate(@Param('concertId') concertId: string, @Param('concertDateId') concertDate: Date): Promise<IConcertDate> {
        return this.createConcertDateUseCase.excute(concertId, concertDate)
    }

    @Post(':concertDateId/seat')
    @ApiOperation({
        summary: '좌석 생성',
    })
    @ApiParam({ name: 'concertId', required: true, description: 'concertId ID' })
    @ApiBody({ schema: { type: 'object', properties: { seatNumber: { type: 'number', example: 1 } } } })
    async createSeat(@Param('concertDateId') concertDateId: string, @Body() seatNumber: number): Promise<ISeat> {
        return this.createSeatUseCase.excute(concertDateId, seatNumber)
    }
}
