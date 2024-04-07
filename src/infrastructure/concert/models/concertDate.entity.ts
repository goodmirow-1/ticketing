import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index, ManyToOne, JoinColumn } from 'typeorm'
import { Concert } from './concert.entity'
import { Seat } from './seat.entity'
import type { IConcertDate } from 'src/domain/concert/models/concertDate.entity.interface'

@Entity()
export class ConcertDate implements IConcertDate {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Index() // Adding an index to improve performance for queries filtering by date
    @Column()
    date: Date

    @Column()
    availableSeats: number

    @ManyToOne(() => Concert, concert => concert.concertDates)
    @JoinColumn({ name: 'concertId' })
    concert: Concert

    @OneToMany(() => Seat, seat => seat.concertDate)
    seats: Seat[]
}
