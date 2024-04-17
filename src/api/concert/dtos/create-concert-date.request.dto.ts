import { IsDateString } from 'class-validator'

export class CreateConcertDateDto {
    @IsDateString()
    concertDate: Date
}
