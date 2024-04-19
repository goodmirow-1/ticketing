import type { TokenResponseDto } from 'src/api/user-waiting/dtos/token-reponse.dto'
import type { ICommand } from 'src/application/common/command.interface'
import type { GenerateWaitingTokenUseCase } from '../usecase/generate-waiting-token.usecase'

export class GenerateWaitingTokenCommand implements ICommand<TokenResponseDto | number> {
    // Specify the correct type instead of any if known
    constructor(
        private readonly generateWaitingTokenUseCase: GenerateWaitingTokenUseCase,
        private readonly userId: string,
    ) {}

    execute(): Promise<any> {
        // Specify the return type if known
        return this.generateWaitingTokenUseCase.excute(this.userId)
    }
}
