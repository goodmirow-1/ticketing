// dtos/application-create-concert.request.dto.ts

import type { IRequestDTO } from 'src/application/common/request.interface'

// Define the type for the Create Concert request data
export type PaymentUserConcertRequestType = {
    userId: string
    reservationId: string
    token?: string
}

export class PaymentUserConcertRequestDto implements IRequestDTO<PaymentUserConcertRequestType> {
    constructor(
        private readonly userId: string,
        private readonly reservationId: string,
        private readonly token?: string,
    ) {}

    validate() {}

    toUseCaseInput(): PaymentUserConcertRequestType {
        // Returns the data in the format expected by the use case
        return { userId: this.userId, reservationId: this.reservationId, token: this.token }
    }
}

export class PaymentUserConcertResponseDto {
    constructor(
        public userId: string,
        public reservationId: string,
        public amount: number,
        public payment_at: Date,
    ) {}
}
