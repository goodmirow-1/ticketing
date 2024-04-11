import type { IValidToken } from 'src/domain/waiting/models/valid-token.entity.interface'
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm'

@Entity()
export class ValidToken implements IValidToken {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Index()
    //@Column({ unique: true })
    @Column()
    token: string

    @Column()
    expiration: number

    @Column({ default: true })
    status: boolean
}
