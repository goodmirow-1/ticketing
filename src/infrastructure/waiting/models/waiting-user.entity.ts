import type { IWaitingUser } from 'src/domain/waiting/models/waiting-user.entity.interface'
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../../user/models/user.entity'

@Entity()
export class WaitingUser implements IWaitingUser {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'userId' })
    user: User
}
