import type { IWaitingScheduler } from 'src/domain/waiting/models/waiting-scheduler.entity.interface'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class WaitingScheduler implements IWaitingScheduler {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ default: false })
    check: boolean
}
