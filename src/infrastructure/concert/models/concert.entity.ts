import { Entity, Column, OneToMany, PrimaryColumn, BeforeInsert } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { ConcertDate } from './concertDate.entity'
import type { IConcert } from 'src/domain/concert/models/concert.entity.interface'

@Entity()
export class Concert implements IConcert {
    @PrimaryColumn({ type: 'char', length: 36 })
    id: string

    @Column()
    singerName: string

    @OneToMany(() => ConcertDate, concertDate => concertDate.concert)
    concertDates: ConcertDate[]

    @BeforeInsert()
    generateId() {
        this.id = uuidv4()
    }
}
