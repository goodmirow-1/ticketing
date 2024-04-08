import { Controller, Get, Param, Post } from '@nestjs/common'
import { ConcertService } from 'src/domain/concert/business/service/concert.service'
import type { ConcertDate } from 'src/infrastructure/concert/models/concertDate.entity'
import type { Reservation } from 'src/infrastructure/concert/models/reservation.entity'
import type { Seat } from 'src/infrastructure/concert/models/seat.entity'
import type { PointHistory } from 'src/infrastructure/user/models/point-history.entity'

@Controller('reservation')
export class ReservationController {
    constructor(private readonly concertService: ConcertService) {}

    @Get(':concertId/date')
    async readDate(@Param('concertId') concertId: number): Promise<ConcertDate[]> {
        return []
    }

    @Get(':concertDateId/seat')
    async readSeat(@Param('concertDateId') concertdateId: number): Promise<Seat[]> {
        return [
            {
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
                reservation: {} as Reservation,
            },
            {
                id: '2',
                seatNumber: 2,
                concertDate: {
                    id: '1',
                    date: new Date('2024-01-01'),
                    availableSeats: 50,
                    concert: { id: '1', singerName: 'concert', concertDates: [] },
                    seats: [],
                },
                status: 'available',
                reservation: {} as Reservation,
            },
        ]
    }

    @Post(':reservationId/payment')
    async makePayment(): Promise<PointHistory> {
        return {
            id: '1',
            amount: 100,
            reason: 'payment',
            user: { id: '1', name: 'user', point: 100, reservations: [] },
            reservation: {} as Reservation,
            paymentDate: new Date(),
        }
    }
}
