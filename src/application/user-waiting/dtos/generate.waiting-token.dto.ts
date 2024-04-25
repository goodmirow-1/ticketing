// dtos/application-create-concert.request.dto.ts

import type { IRequestDTO } from 'src/application/common/request.interface'

// Define the type for the Create Concert request data
export type GenerateWaitingTokenRequestType = {
    userId: string
}

export class GenerateWaitingTokenRequestDto implements IRequestDTO<GenerateWaitingTokenRequestType> {
    constructor(private readonly userId: string) {}

    validate() {}

    toUseCaseInput(): GenerateWaitingTokenRequestType {
        // Returns the data in the format expected by the use case
        return { userId: this.userId }
    }
}

export class GenerateWaitingTokenResponseDto {
    constructor(
        public token: string,
        public waitingNumber: number,
    ) {}
}
