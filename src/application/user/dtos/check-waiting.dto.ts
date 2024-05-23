// dtos/application-create-concert.request.dto.ts

import type { IRequestDTO } from 'src/application/common/request.interface'
import { NotFoundUserError } from 'src/domain/user/exceptions/not-found-user.exception'

// Define the type for the Create Concert request data
export type CheckWaitingRequestType = {
    userId: string
    waitingCount: number
}

export class CheckWaitingRequestDto implements IRequestDTO<CheckWaitingRequestType> {
    constructor(
        private readonly userId: string,
        private readonly waitingCount: number,
    ) {}

    validate() {
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

        if (!uuidPattern.test(this.userId)) throw new NotFoundUserError(`User id ${this.userId} not found`)
    }

    toUseCaseInput(): CheckWaitingRequestType {
        // Returns the data in the format expected by the use case
        return { userId: this.userId, waitingCount: this.waitingCount }
    }
}

export class CheckWaitingResponseDto {
    constructor(
        public userId: string,
        public token: string,
        public waitingNumber: number,
    ) {}
}
