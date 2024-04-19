import type { ICommand } from 'src/application/common/command.interface'
import type { ChargeUserPointUseCase } from '../usecase/charge-user-point.usecase'

export class ChargeUserPointCommand implements ICommand<number> {
    constructor(
        private readonly chargeUserPointUseCase: ChargeUserPointUseCase,
        private readonly userId: string,
        private readonly amount: number,
    ) {}

    execute(): Promise<number> {
        return this.chargeUserPointUseCase.excute(this.userId, this.amount)
    }
}
