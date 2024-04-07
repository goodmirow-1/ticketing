import { Controller, Param, Post } from '@nestjs/common'
import type { Seat } from 'src/infrastructure/concert/models/seat.entity'

@Controller('seat')
export class SeatController {
    constructor() {}

    @Post(':seatId')
    async reserveSeat(@Param('seatId') seatId: number): Promise<Seat> {
        return {
            id: '1',
            seatNumber: 1,
            concertDate: {
                id: '1',
                date: new Date('2024-01-01'),
                availableSeats: 50,
                concert: { id: '1', singerName: 'concert', concertDates: [] },
                seats: [],
            },
            status: 'available',
            reservations: [],
        }
    }
}
