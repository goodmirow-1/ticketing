// dtos/application-create-concert.request.dto.ts

import type { IRequestDTO } from 'src/application/common/request.interface'

// Define the type for the Create Concert request data
export type GenerateTokenRequestType = {
    userId: string
}

export class GenerateTokenRequestDto implements IRequestDTO<GenerateTokenRequestType> {
    constructor(private readonly userId: string) {}

    validate() {}

    toUseCaseInput(): GenerateTokenRequestType {
        // Returns the data in the format expected by the use case
        return { userId: this.userId }
    }
}

export class GenerateTokenResponseDto {
    constructor(
        public userId: string,
        public token: string,
        public waitingNumber: number,
    ) {}
}
