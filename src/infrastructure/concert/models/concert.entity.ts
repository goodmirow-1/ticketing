import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { ConcertDate } from './concertDate.entity'
import type { IConcert } from 'src/domain/concert/models/concert.entity.interface'

@Entity()
export class Concert implements IConcert {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    singerName: string

    @OneToMany(() => ConcertDate, concertDate => concertDate.concert)
    concertDates: ConcertDate[]
}
