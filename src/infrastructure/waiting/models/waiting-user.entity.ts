import type { IWaitingUser } from 'src/domain/waiting/models/waiting-user.entity.interface'
import { Entity, ManyToOne, JoinColumn, PrimaryColumn, BeforeInsert } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { User } from '../../user/models/user.entity'

@Entity()
export class WaitingUser implements IWaitingUser {
    @PrimaryColumn({ type: 'char', length: 36 })
    id: string

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'userId' })
    user: User

    @BeforeInsert()
    generateId() {
        this.id = uuidv4()
    }
}
