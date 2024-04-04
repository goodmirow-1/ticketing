import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm'
import { ConcertDate } from './concertDate.entity'
import { Reservation } from './reservation.entity'
import type { ISeat } from 'src/domain/concert/models/seat.interface'

@Entity()
export class Seat implements ISeat {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'int' })
    seatNumber: number

    @Index() // Indexing concertDateId for faster lookups by date
    @ManyToOne(() => ConcertDate, concertDate => concertDate.seats)
    @JoinColumn({ name: 'concertDateId' })
    concertDate: ConcertDate

    @Index() // Indexing status to quickly filter by available, reserved, or held seats
    @Column({ default: 'available' })
    status: 'available' | 'reserved' | 'held'

    @OneToMany(() => Reservation, reservation => reservation.seat)
    reservations: Reservation[]
}
