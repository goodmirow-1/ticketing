import { IsNumber, Min } from 'class-validator'

export class CheckWaitingDto {
    @IsNumber()
    @Min(0)
    waitingNumber: number
}
