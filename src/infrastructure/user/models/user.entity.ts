import type { IUser } from '../../../domain/user/models/user.entity.interface'
import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

@Entity()
export class User implements IUser {
    @PrimaryColumn({ type: 'char', length: 36 })
    id: string

    @Column()
    name: string

    @Column({ default: 0 })
    point: number

    @BeforeInsert()
    generateId() {
        this.id = uuidv4()
    }
}
