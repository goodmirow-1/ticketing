import type { IRequestDTO } from 'src/application/common/request.interface'
import type { ISeat } from 'src/domain/concert/models/seat.entity.interface'

export type ReadAllSeatsByConcertDateRequestType = {
    concertDateId: string
    userId: string
}

export class ReadAllSeatsByConcertRequestDto implements IRequestDTO<ReadAllSeatsByConcertDateRequestType> {
    constructor(
        private readonly concertDateId: string,
        private readonly userId: string,
    ) {}

    validate() {}

    toUseCaseInput(): ReadAllSeatsByConcertDateRequestType {
        return { concertDateId: this.concertDateId, userId: this.userId }
    }
}

export class ReadAllSeatsByConcertResponseDto {
    constructor(public seats: ISeat[]) {}
}
