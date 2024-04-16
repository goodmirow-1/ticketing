import { Entity, ManyToOne, JoinColumn, Column, Unique, PrimaryColumn, BeforeInsert } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { Concert } from './concert.entity'
import { Seat } from './seat.entity'
import { ConcertDate } from './concertDate.entity'
import type { IReservation } from '../../../domain/concert/models/reservation.entity.interface'

@Entity()
@Unique(['concert', 'concertDate', 'seat']) // Composite unique constraint
export class Reservation implements IReservation {
    @PrimaryColumn({ type: 'char', length: 36 })
    id: string

    @Column({ type: 'char', length: 36 })
    userId: string

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
