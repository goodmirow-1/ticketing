import type { IWaitingUser } from '../../../domain/waiting/models/waiting-user.entity.interface'
import { Entity, PrimaryColumn, BeforeInsert, CreateDateColumn, Column } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

@Entity()
export class WaitingUser implements IWaitingUser {
    @PrimaryColumn({ type: 'char', length: 36 })
    id: string

    @Column({ type: 'char', length: 36 })
    userId: string

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date

    @BeforeInsert()
    generateId() {
        this.id = uuidv4()
    }
}
