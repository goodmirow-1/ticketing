// dtos/application-create-concert.request.dto.ts

import type { IRequestDTO } from 'src/application/common/request.interface'
import type { IConcert } from 'src/domain/concert/models/concert.entity.interface'
import type { IConcertDate } from 'src/domain/concert/models/concertDate.entity.interface'
import type { ISeat } from 'src/domain/concert/models/seat.entity.interface'

// Define the type for the Create Concert request data
export type CreateReservationRequestType = {
    seatId: string
    userId: string
}

export class CreateReservationRequestDto implements IRequestDTO<CreateReservationRequestType> {
    constructor(
        private readonly seatId: string,
        private readonly userId: string,
    ) {}

    validate() {}

    toUseCaseInput(): CreateReservationRequestType {
        // Returns the data in the format expected by the use case
        return { seatId: this.seatId, userId: this.userId }
    }
}

export class CreateReservationResponseDto {
    constructor(
        public id: string,
        public userId: string,
        public seat: ISeat,
        public concert: IConcert,
        public concertDate: IConcertDate,
        public holdExpiresAt: Date,
        public paymentCompleted: boolean,
    ) {}
}
