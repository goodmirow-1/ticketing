import type { IConcert } from 'src/domain/concert/models/concert.entity.interface'

export class ReadAllConcertsResponseDto {
    constructor(public concerts: IConcert[]) {}
}
