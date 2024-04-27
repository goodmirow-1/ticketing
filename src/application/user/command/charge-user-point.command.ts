import type { ICommand } from 'src/application/common/command.interface'
import type { ChargeUserPointUseCase } from '../usecase/charge-user-point.usecase'
import { ChargeUserPointRequestDto, type ChargeUserPointResponseDto } from '../dtos/charge-user-point.dto'

export class ChargeUserPointCommand implements ICommand<ChargeUserPointResponseDto> {
    constructor(
        private readonly chargeUserPointUseCase: ChargeUserPointUseCase,
        private readonly userId: string,
        private readonly amount: number,
    ) {}

    execute(): Promise<ChargeUserPointResponseDto> {
        const request = new ChargeUserPointRequestDto(this.userId, this.amount)

        return this.chargeUserPointUseCase.execute(request)
    }
}
