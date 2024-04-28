import type { IUser } from '../../../domain/user/models/user.entity.interface'
import { Entity, Column, PrimaryColumn, BeforeInsert, VersionColumn } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

@Entity()
export class User implements IUser {
    @PrimaryColumn({ type: 'char', length: 36 })
    id: string

    @Column()
    name: string

    @Column({ default: 0 })
    point: number

    @VersionColumn()
    version: number

    @BeforeInsert()
    generateId() {
        this.id = uuidv4()
    }
}
