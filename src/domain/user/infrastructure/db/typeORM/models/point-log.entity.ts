import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './user.entity'
import type { IPointLog } from 'src/domain/user/models/point-log.interface'
import { Reservation } from 'src/domain/concert/business/infrastructure/db/typeorm/models/reservation.entity'

@Entity()
export class PointLog implements IPointLog {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'userId' })
    user: User

    @ManyToOne(() => Reservation, reservation => reservation.id)
    @JoinColumn({ name: 'reservationId' })
    reservation: Reservation

    @Column()
    amount: number

    @Column()
    reason: 'charge' | 'payment'

    @Column({ type: 'timestamp' })
    paymentDate: Date
}
