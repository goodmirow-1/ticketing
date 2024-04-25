// dtos/application-create-concert.request.dto.ts

import type { IRequestDTO } from 'src/application/common/request.interface'

// Define the type for the Create Concert request data
export type CreateUserRequestType = {
    name: string
}

export class CreateUserRequestDto implements IRequestDTO<CreateUserRequestType> {
    constructor(private readonly name: string) {}

    validate() {}

    toUseCaseInput(): CreateUserRequestType {
        // Returns the data in the format expected by the use case
        return { name: this.name }
    }
}

export class CreateUserResponseDto {
    constructor(
        public id: string,
        public name: string,
    ) {}
}
