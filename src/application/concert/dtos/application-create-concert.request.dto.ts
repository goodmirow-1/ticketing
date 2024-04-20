// dtos/application-create-concert.request.dto.ts

import type { IRequestDTO } from 'src/application/common/request.interface'

// Define the type for the Create Concert request data
export type ApplicationCreateConcertRequestType = {
    singerName: string
}

export class ApplicationCreateConcertRequestDto implements IRequestDTO<ApplicationCreateConcertRequestType> {
    constructor(public singerName: string) {}

    validate(): boolean {
        // Basic validation to check that singerName is not empty
        return !!this.singerName
    }

    toUseCaseInput(): ApplicationCreateConcertRequestType {
        // Returns the data in the format expected by the use case
        return { singerName: this.singerName }
    }
}
