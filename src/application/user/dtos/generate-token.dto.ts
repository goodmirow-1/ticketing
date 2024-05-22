// dtos/application-create-concert.request.dto.ts

import type { IRequestDTO } from 'src/application/common/request.interface'
import { NotFoundUserError } from 'src/domain/user/exceptions/not-found-user.exception'

// Define the type for the Create Concert request data
export type GenerateTokenRequestType = {
    userId: string
}

export class GenerateTokenRequestDto implements IRequestDTO<GenerateTokenRequestType> {
    constructor(private readonly userId: string) {}

    validate() {
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

        if (!uuidPattern.test(this.userId)) throw new NotFoundUserError(`User id ${this.userId} not found`)
    }

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
