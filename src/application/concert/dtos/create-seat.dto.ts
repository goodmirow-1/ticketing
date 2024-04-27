// dtos/application-create-concert.request.dto.ts

import type { IRequestDTO } from 'src/application/common/request.interface'
import { InValidPriceError } from 'src/domain/concert/exceptions/invalid-price.exception'
import { InValidSeatNumberError } from 'src/domain/concert/exceptions/invalid-seat-number.exception'
import type { IConcertDate } from 'src/domain/concert/models/concertDate.entity.interface'

// Define the type for the Create Concert request data
export type CreateSeatRequestType = {
    concertDateId: string
    seatNumber: number
    price: number
}

export class CreateSeatRequestDto implements IRequestDTO<CreateSeatRequestType> {
    constructor(
        private readonly concertDateId: string,
        private readonly seatNumber: number,
        private readonly price: number,
    ) {}

    validate() {
        if (this.seatNumber < 1 || this.seatNumber > parseInt(process.env.MAX_SEATS, 10)) {
            throw new InValidSeatNumberError(`Seat number must be between 1 and max seats`)
        }

        if (this.price <= 0) {
            throw new InValidPriceError()
        }
    }

    toUseCaseInput(): CreateSeatRequestType {
        // Returns the data in the format expected by the use case
        return { concertDateId: this.concertDateId, seatNumber: this.seatNumber, price: this.price }
    }
}

export class CreateSeatResponseDto {
    constructor(
        public id: string,
        public seatNumber: number,
        public price: number,
        public concertDate: IConcertDate,
        public status: string,
    ) {}
}
