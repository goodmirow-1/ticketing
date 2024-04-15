import { Entity, ManyToOne, JoinColumn, Column, Unique, PrimaryColumn, BeforeInsert } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { Concert } from './concert.entity'
import { Seat } from './seat.entity'
import { ConcertDate } from './concertDate.entity'
import type { IReservation } from '../../../domain/concert/models/reservation.entity.interface'
import { User } from '../../../infrastructure/user/models/user.entity'

@Entity()
@Unique(['concert', 'concertDate', 'seat']) // Composite unique constraint
export class Reservation implements IReservation {
    @PrimaryColumn({ type: 'char', length: 36 })
    id: string

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

    @BeforeInsert()
    generateId() {
        this.id = uuidv4()
    }
}
