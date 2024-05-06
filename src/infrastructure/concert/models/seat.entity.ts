import { Entity, Column, ManyToOne, JoinColumn, Index, OneToOne, PrimaryColumn, BeforeInsert } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { ConcertDate } from './concertDate.entity'
import { Reservation } from './reservation.entity'
import type { ISeat } from '../../../domain/concert/models/seat.entity.interface'

@Entity()
@Index('IDX_CONCERT_DATE_STATUS', ['concertDate.id', 'status']) // 복합 인덱스 추가
export class Seat implements ISeat {
    @PrimaryColumn({ type: 'char', length: 36 })
    id: string

    @Column({ type: 'int' })
    seatNumber: number

    @Column({ type: 'int', default: 0 })
    price: number

    @ManyToOne(() => ConcertDate, concertDate => concertDate.seats)
    @JoinColumn({ name: 'concertDateId' })
    concertDate: ConcertDate

    @Column({ default: 'available' })
    status: 'available' | 'reserved' | 'held'

    @OneToOne(() => Reservation, reservation => reservation.seat)
    reservation: Reservation

    @BeforeInsert()
    generateId() {
        this.id = uuidv4()
    }
}
