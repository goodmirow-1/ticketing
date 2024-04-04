import type { IValidToken } from 'src/domain/user/models/valid-token.interface'
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm'

@Entity()
export class ValidToken implements IValidToken {
    @PrimaryGeneratedColumn()
    id: number

    @Index()
    @Column({ nullable: true })
    token: string

    @Column({ type: 'timestamp', nullable: true })
    expiration: Date
}
