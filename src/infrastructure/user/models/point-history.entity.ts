import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { User } from './user.entity'
import type { IPointHistory } from 'src/domain/user/models/point-history.entity.interface'
import { Reservation } from 'src/infrastructure/concert/models/reservation.entity'

@Entity()
export class PointHistory implements IPointHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string

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
