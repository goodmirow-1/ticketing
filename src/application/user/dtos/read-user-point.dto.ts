// dtos/application-create-concert.request.dto.ts

import type { IRequestDTO } from 'src/application/common/request.interface'

// Define the type for the Create Concert request data
export type ReadUserPointRequestType = {
    userId: string
}

export class ReadUserPointRequestDto implements IRequestDTO<ReadUserPointRequestType> {
    constructor(private readonly userId: string) {}

    validate() {}

    toUseCaseInput(): ReadUserPointRequestType {
        // Returns the data in the format expected by the use case
        return { userId: this.userId }
    }
}

export class ReadUserPointResponseDto {
    constructor(public point: number) {}
}
