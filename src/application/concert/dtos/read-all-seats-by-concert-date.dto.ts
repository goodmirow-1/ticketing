// dtos/application-create-concert.request.dto.ts

import type { IRequestDTO } from 'src/application/common/request.interface'
import type { ISeat } from 'src/domain/concert/models/seat.entity.interface'

// Define the type for the Create Concert request data
export type ReadAllSeatsByConcertDateRequestType = {
    concertDateId: string
}

export class ReadAllSeatsByConcertRequestDto implements IRequestDTO<ReadAllSeatsByConcertDateRequestType> {
    constructor(private readonly concertDateId: string) {}

    validate() {}

    toUseCaseInput(): ReadAllSeatsByConcertDateRequestType {
        // Returns the data in the format expected by the use case
        return { concertDateId: this.concertDateId }
    }
}

export class ReadAllSeatsByConcertResponseDto {
    constructor(public seats: ISeat[]) {}
}
