import { Reservation } from '../../../infrastructure/concert/models/reservation.entity'
import type { IUser } from '../../../domain/user/models/user.entity.interface'
import { Entity, Column, OneToMany, PrimaryColumn, BeforeInsert } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

@Entity()
export class User implements IUser {
    @PrimaryColumn({ type: 'char', length: 36 })
    id: string

    @Column()
    name: string

    @Column({ default: 10000 })
    point: number

    @OneToMany(() => Reservation, reservation => reservation.user)
    reservations: Reservation[]

    @BeforeInsert()
    generateId() {
        this.id = uuidv4()
    }
}
