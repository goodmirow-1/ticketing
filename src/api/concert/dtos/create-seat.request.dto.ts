import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Min } from 'class-validator'

export class CreateSeatDto {
    @ApiProperty({ description: 'The number of the seat', example: 1 })
    @IsNumber()
    @Min(1, { message: 'Seat number must be at least 1' })
    seatNumber: number

    @ApiProperty({ description: 'The price of the seat', example: 1000 })
    @IsNumber()
    @Min(1, { message: 'Price must be at least 1' })
    price: number
}
