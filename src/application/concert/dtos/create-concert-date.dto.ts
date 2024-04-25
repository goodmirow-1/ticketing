// dtos/application-create-concert.request.dto.ts

import type { IRequestDTO } from 'src/application/common/request.interface'
import type { IConcert } from 'src/domain/concert/models/concert.entity.interface'

// Define the type for the Create Concert request data
export type CreateConcertDateRequestType = {
    concertId: string
    date: Date
}

export class CreateConcertDateRequestDto implements IRequestDTO<CreateConcertDateRequestType> {
    constructor(
        private readonly concertId: string,
        private readonly concertDate: Date,
    ) {}

    validate() {}

    toUseCaseInput(): CreateConcertDateRequestType {
        // Returns the data in the format expected by the use case
        return { concertId: this.concertId, date: this.concertDate }
    }
}

export class CreateConcertDateResponsetDto {
    constructor(
        public id: string,
        public concert: IConcert,
        public concertDate: Date,
    ) {}
}
