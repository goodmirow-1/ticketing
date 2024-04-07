import type { IWaitingUser } from 'src/domain/user/models/waiting-user.entity.interface'
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class WaitingUser implements IWaitingUser {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    token: string
}
