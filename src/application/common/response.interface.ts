// common/dtos/response.dto.ts
export interface IResponseDTO<T> {
    data: T
}

export class ResponseDTO<T> implements IResponseDTO<T> {
    constructor(public data: T) {}
}
