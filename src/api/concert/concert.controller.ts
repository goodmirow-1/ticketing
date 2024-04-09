import { Body, Controller, Get, Post } from '@nestjs/common'
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
    async readAllConcerts(): Promise<IConcert[]> {
        return this.readAllConcertsUseCase.excute()
    }

    @Get(':concertDateId/seats')
    async readAllSeatsByConcertDateId(concertDateId: string): Promise<ISeat[]> {
        return this.readAllSeatsByConcertDateIdUseCase.excute(concertDateId)
    }

    @Post()
    async createConcert(@Body() singerName: string): Promise<IConcert> {
        return this.createConcertUseCase.excute(singerName)
    }

    @Post(':concertId/concert-date')
    async createConcertDate(@Body() concertId: string, concertDate: Date): Promise<IConcertDate> {
        return this.createConcertDateUseCase.excute(concertId, concertDate)
    }

    @Post(':concertDateId/seat')
    async createSeat(@Body() concertDateId: string, seatNumber: number): Promise<ISeat> {
        return this.createSeatUseCase.excute(concertDateId, seatNumber)
    }

    @Post(':seatId/reservation')
    async createReservation(@Body() seatId: string, userId: string): Promise<IReservation> {
        return this.createReservationUseCase.excute(seatId, userId)
    }
}
