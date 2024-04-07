import { Reservation } from 'src/domain/concert/business/infrastructure/db/typeorm/models/reservation.entity'
import type { IUser } from 'src/domain/user/models/user.entity.interface'
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'

@Entity()
export class User implements IUser {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column({ default: 0 })
    point: number

    @OneToMany(() => Reservation, reservation => reservation.user)
    reservations: Reservation[]
}