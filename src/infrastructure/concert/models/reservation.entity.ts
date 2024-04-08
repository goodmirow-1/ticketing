import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, Unique } from 'typeorm'
import { Concert } from './concert.entity'
import { Seat } from './seat.entity'
import { ConcertDate } from './concertDate.entity'
import type { IReservation } from 'src/domain/concert/models/reservation.entity.interface'
import { User } from 'src/infrastructure/user/models/user.entity'

@Entity()
@Unique(['concert', 'concertDate', 'seat']) // Composite unique constraint
export class Reservation implements IReservation {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    amount: number

    @ManyToOne(() => User, user => user.reservations)
    @JoinColumn({ name: 'userId' })
    user: User

    @ManyToOne(() => Seat, seat => seat.reservation)
    @JoinColumn({ name: 'seatId' })
    seat: Seat

    @ManyToOne(() => Concert)
    @JoinColumn({ name: 'concertId' })
    concert: Concert

    @ManyToOne(() => ConcertDate)
    @JoinColumn({ name: 'concertDateId' })
    concertDate: ConcertDate

    @Column({ type: 'timestamp', nullable: true })
    holdExpiresAt: Date

    @Column({ default: false })
    paymentCompleted: boolean
}
