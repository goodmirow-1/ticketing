import type { TokenResponseDto } from 'src/api/user-waiting/dtos/token-reponse.dto'
import type { ICommand } from 'src/application/common/command.interface'
import type { GenerateTokenUseCase } from '../usecase/generate-token.usecase'

export class GenerateTokenCommand implements ICommand<TokenResponseDto> {
    constructor(
        private readonly generateTokenUseCase: GenerateTokenUseCase,
        private readonly userId: string,
    ) {}

    execute(): Promise<TokenResponseDto> {
        return this.generateTokenUseCase.excute(this.userId)
    }
}
