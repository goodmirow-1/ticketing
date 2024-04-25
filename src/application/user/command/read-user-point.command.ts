import type { ICommand } from 'src/application/common/command.interface'
import type { ReadUserPointUseCase } from '../usecase/read-user-point.usecase'
import type { ReadUserPointResponseDto } from '../dtos/read-user-point.dto'
import { ReadUserPointRequestDto } from '../dtos/read-user-point.dto'

export class ReadUserPointCommand implements ICommand<ReadUserPointResponseDto> {
    constructor(
        private readonly readUserPointUseCase: ReadUserPointUseCase,
        private readonly userId: string,
    ) {}

    execute(): Promise<ReadUserPointResponseDto> {
        const requestDto = new ReadUserPointRequestDto(this.userId)

        return this.readUserPointUseCase.execute(requestDto)
    }
}
