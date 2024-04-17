import { IsNumber, Min } from 'class-validator'

export class CreateSeatDto {
    @IsNumber()
    @Min(1)
    seatNumber: number

    @IsNumber()
    @Min(1)
    price: number
}
