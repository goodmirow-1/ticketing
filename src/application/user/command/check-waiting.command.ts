import type { ICommand } from 'src/application/common/command.interface'
import type { CheckWaitingResponseDto } from '../dtos/check-waiting.dto'
import { CheckWaitingRequestDto } from '../dtos/check-waiting.dto'
import type { CheckWaitingUseCase } from '../usecase/check-waiting.usecase'

export class CheckWaitingCommand implements ICommand<CheckWaitingResponseDto> {
    constructor(
        private readonly usecase: CheckWaitingUseCase,
        private readonly userId: string,
    ) {}

    execute(): Promise<CheckWaitingResponseDto> {
        const requestDto = new CheckWaitingRequestDto(this.userId)

        return this.usecase.execute(requestDto)
    }
}
