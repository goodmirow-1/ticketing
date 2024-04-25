// common/interfaces/request-dto.interface.ts
export interface IRequestDTO<T> {
    validate()
    toUseCaseInput(): T
}
