// dtos/application-create-concert.request.dto.ts

import type { IRequestDTO } from 'src/application/common/request.interface'

// Define the type for the Create Concert request data
export type CheckWaitingRequestType = {
    userId: string
}

export class CheckWaitingRequestDto implements IRequestDTO<CheckWaitingRequestType> {
    constructor(private readonly userId: string) {}

    validate() {}

    toUseCaseInput(): CheckWaitingRequestType {
        // Returns the data in the format expected by the use case
        return { userId: this.userId }
    }
}

export class CheckWaitingResponseDto {
    constructor(
        public userId: string,
        public token: string,
        public waitingNumber: number,
    ) {}
}
