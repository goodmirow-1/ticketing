import type { IWaitingUser } from 'src/domain/user/models/waiting-user.interface'
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class WaitingUser implements IWaitingUser {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    token: string

    @Column()
    number: number
}
