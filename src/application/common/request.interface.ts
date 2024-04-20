// common/interfaces/request-dto.interface.ts
export interface IRequestDTO<T> {
    validate(): boolean
    toUseCaseInput(): T
}
