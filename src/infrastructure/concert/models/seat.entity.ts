import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, OneToOne } from 'typeorm'
import { ConcertDate } from './concertDate.entity'
import { Reservation } from './reservation.entity'
import type { ISeat } from 'src/domain/concert/models/seat.entity.interface'

@Entity()
export class Seat implements ISeat {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'int' })
    seatNumber: number

    @Index() // Indexing concertDateId for faster lookups by date
    @ManyToOne(() => ConcertDate, concertDate => concertDate.seats)
    @JoinColumn({ name: 'concertDateId' })
    concertDate: ConcertDate

    @Index() // Indexing status to quickly filter by available, reserved, or held seats
    @Column({ default: 'available' })
    status: 'available' | 'reserved' | 'held'

    @OneToOne(() => Reservation, reservation => reservation.seat)
    reservation: Reservation
}
