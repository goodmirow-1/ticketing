import type { IRequestDTO } from 'src/application/common/request.interface'
import type { IConcert } from 'src/domain/concert/models/concert.entity.interface'

export type ReadAllConcertsRequestType = {
    userId: string
}

export class ReadAllConcertsRequestDto implements IRequestDTO<ReadAllConcertsRequestType> {
    constructor(private readonly userId: string) {}

    validate() {}

    toUseCaseInput(): ReadAllConcertsRequestType {
        // Returns the data in the format expected by the use case
        return { userId: this.userId }
    }
}

export class ReadAllConcertsResponseDto {
    constructor(public concerts: IConcert[]) {}
}
