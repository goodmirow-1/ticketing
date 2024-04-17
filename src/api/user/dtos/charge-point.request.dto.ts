import { IsNumber, Min } from 'class-validator'

export class ChargePointDto {
    @IsNumber()
    @Min(1) // 최소 충전 금액은 1
    amount: number
}
