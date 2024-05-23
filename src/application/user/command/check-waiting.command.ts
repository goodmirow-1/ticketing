import type { ICommand } from 'src/application/common/command.interface'
import type { CheckWaitingResponseDto } from '../dtos/check-waiting.dto'
import { CheckWaitingRequestDto } from '../dtos/check-waiting.dto'
import type { CheckWaitingUseCase } from '../usecase/check-waiting.usecase'

export class CheckWaitingCommand implements ICommand<CheckWaitingResponseDto> {
    constructor(
        private readonly usecase: CheckWaitingUseCase,
        private readonly userId: string,
        private readonly waitingCount: number,
    ) {}

    execute(): Promise<CheckWaitingResponseDto> {
        const requestDto = new CheckWaitingRequestDto(this.userId, this.waitingCount)

        return this.usecase.execute(requestDto)
    }
}
