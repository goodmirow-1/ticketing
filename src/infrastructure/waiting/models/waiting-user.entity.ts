import type { IWaitingUser } from '../../../domain/waiting/models/waiting-user.entity.interface'
import { Entity, ManyToOne, JoinColumn, PrimaryColumn, BeforeInsert, CreateDateColumn } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { User } from '../../user/models/user.entity'

@Entity()
export class WaitingUser implements IWaitingUser {
    @PrimaryColumn({ type: 'char', length: 36 })
    id: string

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'userId' })
    user: User

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date

    @BeforeInsert()
    generateId() {
        this.id = uuidv4()
    }
}
