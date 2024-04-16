import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'

export class FailedUserChargePointError extends CustomException {
    constructor(msg?: string) {
        super(msg ?? 'Failed user charge point', HttpStatus.NOT_FOUND)
    }
}
