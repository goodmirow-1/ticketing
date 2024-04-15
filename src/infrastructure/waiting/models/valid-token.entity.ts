import type { IValidToken } from '../../../domain/waiting/models/valid-token.entity.interface'
import { Entity, Column, BeforeInsert, PrimaryColumn } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

@Entity()
export class ValidToken implements IValidToken {
    @PrimaryColumn({ type: 'char', length: 36 })
    id: string

    @Column()
    userId: string

    @Column({ unique: true })
    token: string

    @Column()
    expiration: number

    @Column({ default: true })
    status: boolean

    @BeforeInsert()
    generateId() {
        this.id = uuidv4()
    }
}
