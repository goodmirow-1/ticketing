import type { ICommand } from 'src/application/common/command.interface'
import type { GenerateWaitingTokenUseCase } from '../usecase/generate-waiting-token.usecase'
import type { GenerateWaitingTokenResponseDto } from '../dtos/generate.waiting-token.dto'
import { GenerateWaitingTokenRequestDto } from '../dtos/generate.waiting-token.dto'

export class GenerateWaitingTokenCommand implements ICommand<GenerateWaitingTokenResponseDto> {
    // Specify the correct type instead of any if known
    constructor(
        private readonly generateWaitingTokenUseCase: GenerateWaitingTokenUseCase,
        private readonly userId: string,
    ) {}

    execute(): Promise<GenerateWaitingTokenResponseDto> {
        const requestDto = new GenerateWaitingTokenRequestDto(this.userId)
        // Specify the return type if known
        return this.generateWaitingTokenUseCase.execute(requestDto)
    }
}
