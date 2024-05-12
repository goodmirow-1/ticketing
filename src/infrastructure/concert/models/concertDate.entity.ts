import { Entity, Column, OneToMany, Index, ManyToOne, JoinColumn, PrimaryColumn, BeforeInsert } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { Concert } from './concert.entity'
import { Seat } from './seat.entity'
import type { IConcertDate } from '../../../domain/concert/models/concertDate.entity.interface'

@Entity()
@Index('IDX_CONCERT_DATE', ['concert.id'])
export class ConcertDate implements IConcertDate {
    @PrimaryColumn({ type: 'char', length: 36 })
    id: string

    @Column()
    date: Date

    @Column({ type: 'int' })
    availableSeats: number

    @ManyToOne(() => Concert, concert => concert.concertDates)
    @JoinColumn({ name: 'concertId' })
    concert: Concert

    @OneToMany(() => Seat, seat => seat.concertDate)
    seats: Seat[]

    @BeforeInsert()
    generateId() {
        this.id = uuidv4()
    }
}
