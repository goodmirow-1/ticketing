// dtos/application-create-concert.request.dto.ts

import type { IRequestDTO } from 'src/application/common/request.interface'
import { InValidPointError } from 'src/domain/user/exceptions/invalid-point.exception'

// Define the type for the Create Concert request data
export type ChargeUserPointRequestType = {
    userId: string
    amount: number
}

export class ChargeUserPointRequestDto implements IRequestDTO<ChargeUserPointRequestType> {
    constructor(
        private readonly userId: string,
        private readonly amount: number,
    ) {}

    validate() {
        if (this.amount <= 0) {
            throw new InValidPointError('invalid amount value')
        }
    }

    toUseCaseInput(): ChargeUserPointRequestType {
        // Returns the data in the format expected by the use case
        return { userId: this.userId, amount: this.amount }
    }
}

export class ChargeUserPointResponseDto {
    constructor(public amount: number) {}
}
