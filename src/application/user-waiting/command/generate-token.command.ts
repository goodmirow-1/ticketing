import type { ICommand } from 'src/application/common/command.interface'
import type { GenerateTokenUseCase } from '../usecase/generate-token.usecase'
import type { GenerateTokenResponseDto } from '../dtos/generate-token.dto'
import { GenerateTokenRequestDto } from '../dtos/generate-token.dto'

export class GenerateTokenCommand implements ICommand<GenerateTokenResponseDto> {
    constructor(
        private readonly generateTokenUseCase: GenerateTokenUseCase,
        private readonly userId: string,
    ) {}

    execute(): Promise<GenerateTokenResponseDto> {
        const requestDto = new GenerateTokenRequestDto(this.userId)

        return this.generateTokenUseCase.execute(requestDto)
    }
}
