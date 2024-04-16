import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, PrimaryColumn, BeforeInsert } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { User } from './user.entity'
import type { IPointHistory } from '../../../domain/user/models/point-history.entity.interface'

@Entity()
export class PointHistory implements IPointHistory {
    @PrimaryColumn({ type: 'char', length: 36 })
    id: string

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'userId' })
    user: User

    @Column({ nullable: true })
    reservationId: string

    @Column()
    amount: number

    @Column()
    reason: 'charge' | 'payment'

    @CreateDateColumn({ type: 'datetime', nullable: false })
    created_at: Date

    @BeforeInsert()
    generateId() {
        this.id = uuidv4()
    }
}
