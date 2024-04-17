import { IsString, Length } from 'class-validator'

export class CreateConcertDto {
    @IsString()
    @Length(1, 100)
    singerName: string
}
