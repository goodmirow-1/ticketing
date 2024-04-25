// dtos/application-create-concert.request.dto.ts

import { HttpStatus } from '@nestjs/common'
import type { IRequestDTO } from 'src/application/common/request.interface'
import { CustomException } from 'src/custom-exception'

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
            throw new CustomException('invalid amount value', HttpStatus.BAD_REQUEST)
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
