// dtos/application-create-concert.request.dto.ts

import type { IRequestDTO } from 'src/application/common/request.interface'

// Define the type for the Create Concert request data
export type CreateConcertRequestType = {
    singerName: string
}

export class CreateConcertRequestDto implements IRequestDTO<CreateConcertRequestType> {
    constructor(private readonly singerName: string) {}

    validate() {}

    toUseCaseInput(): CreateConcertRequestType {
        // Returns the data in the format expected by the use case
        return { singerName: this.singerName }
    }
}

export class CreateConcertResponseDto {
    constructor(
        public id: string,
        public singerName: string,
    ) {}
}
