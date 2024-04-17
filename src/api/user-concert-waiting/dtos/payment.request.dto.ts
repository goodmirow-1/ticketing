import { IsString, IsOptional } from 'class-validator'

export class PaymentDto {
    @IsString()
    @IsOptional()
    token?: string // 토큰은 선택적이며, 제공되지 않을 수도 있음을 나타냅니다.
}
